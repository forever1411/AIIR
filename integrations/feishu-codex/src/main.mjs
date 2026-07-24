import {
  createLarkChannel,
  LoggerLevel,
} from "@larksuiteoapi/node-sdk";
import { loadConfig } from "./config.mjs";
import { CodexRpcClient } from "./codex-rpc.mjs";
import { CodexSession } from "./codex-session.mjs";
import {
  HELP_TEXT,
  isGroupSafeCommand,
  pairingMatches,
  parseCommand,
} from "./commands.mjs";
import {
  DEFAULT_MARKDOWN_CHUNK_LIMIT,
  DEFAULT_SLOW_RESPONSE_MS,
  ReplyDeliveryError,
  sendMarkdownReply,
  waitForTurnOrSlow,
} from "./delivery.mjs";
import { safeErrorMessage, safeLogText } from "./safe-log.mjs";
import { loadState, saveState } from "./state.mjs";

const config = loadConfig();
const state = await loadState(config.statePath);
const persistState = () => saveState(config.statePath, state);
const rpc = new CodexRpcClient(config.appServerUrl);

rpc.on("transportError", (error) => {
  console.error(`Codex 连接错误：${safeErrorMessage(error)}`);
});
rpc.on("protocolError", (error) => {
  console.error(`Codex 协议错误：${safeErrorMessage(error)}`);
});

await rpc.connect();
const session = new CodexSession({ rpc, config, state, persistState });
await session.initializeThread();

const channel = createLarkChannel({
  appId: config.appId,
  appSecret: config.appSecret,
  loggerLevel: LoggerLevel.warn,
  outbound: {
    textChunkLimit: DEFAULT_MARKDOWN_CHUNK_LIMIT,
  },
  policy: {
    requireMention: true,
    dmMode: "open",
    respondToMentionAll: false,
  },
});

const authorizedOpenIds = new Set([
  ...config.allowedOpenIds,
  ...state.pairedOpenIds,
]);
let queue = Promise.resolve();
const backgroundDeliveries = new Set();

function isPrivateMessage(message) {
  return message.chatType === "p2p";
}

async function enforceChatPolicy(message, command) {
  if (isPrivateMessage(message)) {
    return true;
  }
  if (!config.allowedGroupChatIds.has(message.chatId)) {
    console.warn("忽略未列入白名单的群聊消息");
    return false;
  }
  if (!isGroupSafeCommand(command.name)) {
    await reply(message, "群聊只允许 help、status 和只读 ask；请在私聊中使用其他命令。");
    return false;
  }
  return true;
}

function terminalCommand() {
  return `codex --ask-for-approval never --sandbox workspace-write resume ${session.threadId} --remote ${config.appServerUrl}`;
}

async function reply(message, text) {
  await sendMarkdownReply(channel, message, text);
}

function partialDeliveryText(error) {
  return [
    `这条回复共 ${error.totalChunks} 段，已成功发送 ${error.sentChunks} 段，后续分段发送失败。`,
    "桥接已停止继续发送，避免产生重复内容；详细错误已写入本机日志。",
  ].join("\n");
}

async function reportFailure(message, error, fallbackText) {
  console.error(`发送或处理飞书回复失败：${safeErrorMessage(error)}`);
  const text =
    error instanceof ReplyDeliveryError && error.sentChunks > 0
      ? partialDeliveryText(error)
      : fallbackText;
  try {
    await reply(message, text);
  } catch (replyError) {
    console.error(`发送错误提示失败：${safeErrorMessage(replyError)}`);
  }
}

function trackLateDelivery(
  message,
  completion,
  { after = Promise.resolve() } = {},
) {
  const delivery = Promise.resolve(after)
    .catch((error) => {
      console.error(`发送慢响应提醒失败：${safeErrorMessage(error)}`);
    })
    .then(() => completion)
    .then(async (outcome) => {
      if (outcome.kind === "error") {
        throw outcome.error;
      }
      await reply(message, outcome.answer);
    })
    .catch((error) =>
      reportFailure(
        message,
        error,
        "这项任务在继续处理后最终失败，详细信息已写入本机日志。",
      ),
    );

  backgroundDeliveries.add(delivery);
  void delivery.finally(() => backgroundDeliveries.delete(delivery));
}

async function authorize(message, command) {
  if (authorizedOpenIds.has(message.senderId)) {
    return true;
  }

  if (
    message.chatType === "p2p" &&
    command.name === "pair" &&
    authorizedOpenIds.size === 0 &&
    pairingMatches(config.pairingCode, command.argument)
  ) {
    authorizedOpenIds.add(message.senderId);
    state.pairedOpenIds = [...authorizedOpenIds];
    state.notificationChatId = message.chatId;
    await persistState();
    await reply(
      message,
      "配对成功。以后可以在这个私聊里直接向 AIIR 提问。输入 `/aiir help` 查看命令。",
    );
    return false;
  }

  await reply(
    message,
    "这个飞书账号尚未授权。请在私聊中发送 `/aiir pair 你的配对码`。",
  );
  return false;
}

async function handleAuthorized(message, command) {
  if (isPrivateMessage(message) && state.notificationChatId !== message.chatId) {
    state.notificationChatId = message.chatId;
    await persistState();
  }

  switch (command.name) {
    case "help":
      await reply(message, HELP_TEXT);
      return;
    case "status":
      await reply(
        message,
        [
          "AIIR 飞书桥：在线",
          ...(isPrivateMessage(message)
            ? [`Codex thread：${session.threadId}`]
            : ["群聊模式：只读，不显示 thread 标识"]),
          `当前状态：${session.busy ? "处理中" : "空闲"}`,
          "默认权限：只读讨论",
          ...(isPrivateMessage(message)
            ? ["按轮写入：使用 /aiir write，仅限 AIIR 仓库"]
            : []),
        ].join("\n"),
      );
      return;
    case "thread":
      await reply(
        message,
        `当前 thread：\`${session.threadId}\`\n\n本机终端接入同一会话：\n\`${terminalCommand()}\``,
      );
      return;
    case "new": {
      const threadId = await session.newThread();
      await reply(message, `已新建 Codex thread：\`${threadId}\``);
      return;
    }
    case "pair":
      await reply(message, "当前飞书账号已经授权，无需重复配对。");
      return;
    case "ask":
      if (!command.argument) {
        await reply(message, "请在 `/aiir ask` 后写上你要问的内容。");
        return;
      }
      break;
    case "write":
      if (!command.argument) {
        await reply(
          message,
          "请在 `/aiir write` 后写清楚要修改什么。该权限只对这一轮有效。",
        );
        return;
      }
      break;
    default:
      await reply(message, `不认识命令 \`${command.name}\`。\n\n${HELP_TEXT}`);
      return;
  }

  const writable = command.name === "write";
  if (session.busy) {
    await reply(
      message,
      "上一条任务仍在处理中，完成后会自动补发最终答案。请稍后再发送新的研究或修改任务；help 和 status 仍可使用。",
    );
    return;
  }
  await reply(
    message,
    writable
      ? "收到。本轮已开放 AIIR 仓库写权限，正在执行；不会 commit 或 push……"
      : "收到，正在以只读模式交给 AIIR 分析……",
  );
  const result = await waitForTurnOrSlow(
    session.ask(command.argument, { writable }),
    DEFAULT_SLOW_RESPONSE_MS,
  );

  if (!result.slow) {
    if (result.outcome.kind === "error") {
      throw result.outcome.error;
    }
    try {
      await reply(message, result.outcome.answer);
    } catch (error) {
      if (
        error instanceof ReplyDeliveryError &&
        error.sentChunks > 0
      ) {
        await reportFailure(message, error, partialDeliveryText(error));
        return;
      }
      throw error;
    }
    return;
  }

  const slowNotice = reply(
    message,
    "本轮处理已超过 15 分钟，任务仍在继续。完成后我会把最终答案自动补发到这里，无需重新提问。",
  );
  trackLateDelivery(message, result.completion, { after: slowNotice });
  await slowNotice;
}

async function handleMessage(message) {
  const messageId = message.messageId;
  if (messageId && state.recentMessageIds.includes(messageId)) {
    return;
  }

  const command = parseCommand(message.content);
  if (!(await enforceChatPolicy(message, command))) {
    return;
  }
  if (!(await authorize(message, command))) {
    return;
  }

  const reserveBeforeHandling = command.name === "write";
  if (messageId && reserveBeforeHandling) {
    state.recentMessageIds = [...state.recentMessageIds, messageId].slice(-200);
    await persistState();
  }
  await handleAuthorized(message, command);
  if (messageId && !reserveBeforeHandling) {
    state.recentMessageIds = [...state.recentMessageIds, messageId].slice(-200);
    await persistState();
  }
}

channel.on("message", (message) => {
  queue = queue
    .then(() => handleMessage(message))
    .catch(async (error) => {
      console.error(`处理飞书消息失败：${safeErrorMessage(error)}`);
      await reportFailure(
        message,
        error,
        "处理失败，详细信息已写入本机日志。",
      );
    });
});

channel.on("reject", (event) => {
  console.warn(`飞书消息被策略拒绝：${safeLogText(event.reason)}`);
});
channel.on("error", (error) => {
  console.error(`飞书入站错误：${safeErrorMessage(error)}`);
});
channel.on("reconnecting", () => {
  console.warn("飞书长连接正在重连");
});
channel.on("reconnected", () => {
  console.info("飞书长连接已恢复");
});

await channel.connect();
console.info(
  `AIIR 飞书桥已启动，sandbox=${config.sandbox}，允许群聊数=${config.allowedGroupChatIds.size}`,
);

let shuttingDown = false;
async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.info(`收到 ${reason}，正在停止`);
  try {
    await channel.disconnect();
  } catch (error) {
    console.error(`停止飞书连接失败：${safeErrorMessage(error)}`);
  }
  rpc.close();
  process.exit(exitCode);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
rpc.on("close", () => {
  void shutdown("Codex app-server 连接断开", 1);
});
