import crypto from "node:crypto";

const GROUP_SAFE_COMMANDS = new Set(["help", "status", "ask"]);

export function isGroupSafeCommand(name) {
  return GROUP_SAFE_COMMANDS.has(name);
}

export const HELP_TEXT = `AIIR 飞书命令

/aiir help：查看命令
/aiir status：查看桥接与 thread 状态
/aiir thread：查看 thread ID 和终端接入命令
/aiir new：新建一条 Codex 会话
/aiir ask 你的问题：发送只读问题
/aiir write 你的任务：仅为这一轮开放 AIIR 仓库写权限

私聊中不写命令时默认只读。写文件必须显式使用 /aiir write。
群聊默认关闭；只有本机白名单中的群可以 @机器人，并且群聊只允许 help、status 和只读 ask。`;

export function parseCommand(content) {
  const text = content.trim();
  if (!text.toLowerCase().startsWith("/aiir")) {
    return { name: "ask", argument: text, explicit: false };
  }
  const rest = text.slice(5).trim();
  if (!rest) {
    return { name: "help", argument: "", explicit: true };
  }
  const [name, ...parts] = rest.split(/\s+/);
  return {
    name: name.toLowerCase(),
    argument: parts.join(" ").trim(),
    explicit: true,
  };
}

export function pairingMatches(expected, supplied) {
  if (!expected || !supplied) {
    return false;
  }
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
