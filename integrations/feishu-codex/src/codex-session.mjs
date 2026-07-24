import { safeErrorMessage } from "./safe-log.mjs";

const REMOTE_INSTRUCTIONS = `
本 turn 来自用户本人的飞书手机端，是 AIIR 的远程讨论入口。
请使用简明、自然、非专业化的中文回答，并遵循仓库中的 AGENTS.md 与 AI_BOOTSTRAP.md。
每个 turn 都会在 application context 中携带由桥接服务生成的权限声明：
- READ_ONLY 表示只允许讨论、查询、研究和状态查看，不得修改文件；
- WORKSPACE_WRITE 表示用户通过 /aiir write 明确授权本轮修改 AIIR 仓库文件和执行必要的本地验证。
无论哪种模式，都不要执行 Git commit/push，不要交易，不要访问仓库以外的敏感文件，也不要触发其他不可逆外部动作。
不要调用交互式用户输入工具；如必须确认，请在最终回复中直接提出问题。
除非用户在当前消息中明确要求，否则不要启动子 Agent。
`.trim();

function permissionContext(writable, repoRoot) {
  if (writable) {
    return {
      value: [
        "WORKSPACE_WRITE",
        "用户已通过飞书命令 /aiir write 明确授权本轮修改文件。",
        `允许范围仅限 AIIR 工作区：${repoRoot}`,
        "可以执行完成任务所必需的本地命令和验证。",
        "不得执行 Git commit/push、交易或仓库外的破坏性操作。",
      ].join("\n"),
      kind: "application",
    };
  }
  return {
    value: [
      "READ_ONLY",
      "本轮没有文件修改授权，只允许读取、讨论、研究和状态检查。",
    ].join("\n"),
    kind: "application",
  };
}

function finalTextFromTurn(turn) {
  const messages = (turn?.items ?? []).filter(
    (item) => item.type === "agentMessage",
  );
  const final = [...messages]
    .reverse()
    .find((item) => item.phase === "final_answer");
  return final?.text || messages.at(-1)?.text || null;
}

export class CodexSession {
  constructor({ rpc, config, state, persistState }) {
    this.rpc = rpc;
    this.config = config;
    this.state = state;
    this.persistState = persistState;
    this.pendingTurn = null;
    this.rpc.on("notification", (message) => this.#onNotification(message));
    this.rpc.on("serverRequest", (message) => this.#onServerRequest(message));
  }

  get threadId() {
    return this.state.threadId;
  }

  get busy() {
    return Boolean(this.pendingTurn);
  }

  async initializeThread() {
    if (this.state.threadId) {
      try {
        await this.rpc.request("thread/resume", {
          threadId: this.state.threadId,
          cwd: this.config.repoRoot,
          sandbox: this.config.sandbox,
          approvalPolicy: "never",
          developerInstructions: REMOTE_INSTRUCTIONS,
          excludeTurns: true,
        });
        return this.state.threadId;
      } catch (error) {
        console.warn(
          `无法恢复旧 thread，将新建：${safeErrorMessage(error)}`,
        );
      }
    }
    return this.newThread();
  }

  async newThread() {
    if (this.busy) {
      throw new Error("当前 Codex turn 尚未结束，不能新建 thread");
    }
    const result = await this.rpc.request("thread/start", {
      cwd: this.config.repoRoot,
      sandbox: this.config.sandbox,
      approvalPolicy: "never",
      developerInstructions: REMOTE_INSTRUCTIONS,
      ephemeral: false,
    });
    this.state.threadId = result.thread.id;
    await this.persistState();
    return this.state.threadId;
  }

  async ask(text, { writable = false, timeoutMs = 15 * 60_000 } = {}) {
    if (!this.state.threadId) {
      await this.initializeThread();
    }
    if (this.busy) {
      throw new Error("Codex 正在处理上一条消息，请稍后再发");
    }

    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(async () => {
        const timedOut = this.pendingTurn;
        if (timedOut) {
          this.pendingTurn = null;
          if (timedOut.turnId) {
            try {
              await this.rpc.request("turn/interrupt", {
                threadId: timedOut.threadId,
                turnId: timedOut.turnId,
              });
            } catch (error) {
              console.warn(
                `中断超时 turn 失败：${safeErrorMessage(error)}`,
              );
            }
          }
        }
        reject(new Error("Codex 本轮处理超过 15 分钟，已停止等待回复"));
      }, timeoutMs);

      this.pendingTurn = {
        threadId: this.state.threadId,
        turnId: null,
        finalText: null,
        resolve,
        reject,
        timer,
      };

      try {
        const result = await this.rpc.request("turn/start", {
          threadId: this.state.threadId,
          input: [{ type: "text", text }],
          cwd: this.config.repoRoot,
          approvalPolicy: "never",
          permissions: writable ? ":workspace" : ":read-only",
          additionalContext: {
            "aiir.feishu.permission": permissionContext(
              writable,
              this.config.repoRoot,
            ),
          },
        });
        if (this.pendingTurn) {
          this.pendingTurn.turnId = result.turn.id;
        }
      } catch (error) {
        clearTimeout(timer);
        this.pendingTurn = null;
        reject(error);
      }
    });
  }

  #onNotification({ method, params }) {
    const pending = this.pendingTurn;
    if (!pending || params?.threadId !== pending.threadId) {
      return;
    }

    if (method === "turn/started" && !pending.turnId) {
      pending.turnId = params.turn?.id ?? null;
      return;
    }

    if (
      method === "item/completed" &&
      (!pending.turnId || params.turnId === pending.turnId) &&
      params.item?.type === "agentMessage"
    ) {
      if (
        params.item.phase === "final_answer" ||
        params.item.phase === null
      ) {
        pending.finalText = params.item.text;
      }
      return;
    }

    if (
      method === "turn/completed" &&
      (!pending.turnId || params.turn?.id === pending.turnId)
    ) {
      clearTimeout(pending.timer);
      this.pendingTurn = null;
      const status = params.turn?.status;
      if (status === "completed") {
        pending.resolve(
          pending.finalText ||
            finalTextFromTurn(params.turn) ||
            "本轮已完成，但没有可显示的文字回复。",
        );
      } else {
        pending.reject(
          new Error(
            params.turn?.error?.message ||
              `Codex 本轮状态异常：${status ?? "unknown"}`,
          ),
        );
      }
    }
  }

  #onServerRequest(message) {
    const pending = this.pendingTurn;
    const params = message.params ?? {};
    if (
      !pending ||
      (params.threadId && params.threadId !== pending.threadId) ||
      (pending.turnId && params.turnId && params.turnId !== pending.turnId)
    ) {
      return;
    }

    if (
      [
        "item/commandExecution/requestApproval",
        "execCommandApproval",
      ].includes(message.method)
    ) {
      this.rpc.respond(message.id, { decision: "decline" });
      return;
    }
    if (
      ["item/fileChange/requestApproval", "applyPatchApproval"].includes(
        message.method,
      )
    ) {
      this.rpc.respond(message.id, { decision: "decline" });
      return;
    }

    this.rpc.respondError(
      message.id,
      -32000,
      "飞书远程入口不支持交互审批或补充输入，请在最终回复中向用户说明。",
    );
  }
}
