import crypto from "node:crypto";

export const HELP_TEXT = `AIIR 飞书命令

/aiir help：查看命令
/aiir status：查看桥接与 thread 状态
/aiir thread：查看 thread ID 和终端接入命令
/aiir new：新建一条 Codex 会话
/aiir ask 你的问题：发送只读问题
/aiir write 你的任务：仅为这一轮开放 AIIR 仓库写权限

私聊中不写命令时默认只读。写文件必须显式使用 /aiir write。群聊中需要 @机器人。`;

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
