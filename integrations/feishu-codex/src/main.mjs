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
  return `codex resume ${session.threadId} --remote ${config.appServerUrl}`;
}

async function reply(message, text) {
  await channel.send(
    message.chatId,
    { markdown: text },
    { replyTo: message.messageId },
  );
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
  await reply(
    message,
    writable
      ? "收到。本轮已开放 AIIR 仓库写权限，正在执行；不会 commit 或 push……"
      : "收到，正在以只读模式交给 AIIR 分析……",
  );
  const answer = await session.ask(command.argument, { writable });
  await reply(message, answer);
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
      try {
        await reply(message, "处理失败，详细信息已写入本机日志。");
      } catch (replyError) {
        console.error(
          `发送错误回复失败：${safeErrorMessage(replyError)}`,
        );
      }
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
