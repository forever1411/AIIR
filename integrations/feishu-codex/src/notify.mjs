import fs from "node:fs/promises";
import { stdin } from "node:process";
import * as lark from "@larksuiteoapi/node-sdk";
import { loadConfig } from "./config.mjs";
import { loadState } from "./state.mjs";

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

const config = loadConfig();
const state = await loadState(config.statePath);
const useStdin = process.argv.includes("--stdin");
const text = useStdin
  ? await readStdin()
  : process.argv.slice(2).filter((arg) => arg !== "--stdin").join(" ").trim();

if (!text) {
  throw new Error("用法：npm run notify -- \"通知内容\"，或加 --stdin 从标准输入读取");
}
if (!state.lastChatId) {
  throw new Error("还没有可通知的 chat_id，请先在飞书中完成配对并发一条消息");
}

const client = new lark.Client({
  appId: config.appId,
  appSecret: config.appSecret,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
  loggerLevel: lark.LoggerLevel.warn,
});

await client.im.v1.message.create({
  params: { receive_id_type: "chat_id" },
  data: {
    receive_id: state.lastChatId,
    content: JSON.stringify({ text }),
    msg_type: "text",
  },
});

await fs.access(config.statePath);
console.info("飞书通知已发送");
