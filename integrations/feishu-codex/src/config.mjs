import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const integrationRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const defaultRepoRoot = path.resolve(integrationRoot, "..", "..");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }
  return value;
}

export function assertLocalAppServerUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("CODEX_APP_SERVER_URL 必须是有效的 WebSocket URL");
  }

  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (
    parsed.protocol !== "ws:" ||
    !loopbackHosts.has(parsed.hostname) ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(
      "CODEX_APP_SERVER_URL 只能使用无凭证的本机 ws://127.0.0.1、localhost 或 ::1 地址",
    );
  }
  return value;
}

function csv(value) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function loadConfig() {
  const sandbox = (process.env.FEISHU_CODEX_SANDBOX ?? "read-only").trim();
  if (sandbox !== "read-only") {
    throw new Error(
      "FEISHU_CODEX_SANDBOX 必须保持 read-only；写权限只能通过 /aiir write 逐轮开放",
    );
  }

  const repoRoot = path.resolve(
    process.env.AIIR_REPO_ROOT?.trim() || defaultRepoRoot,
  );
  const statePath = path.resolve(
    process.env.AIIR_FEISHU_STATE_PATH?.trim() ||
      path.join(
        process.env.XDG_STATE_HOME?.trim() ||
          path.join(os.homedir(), ".local", "state"),
        "aiir-feishu-codex",
        "state.json",
      ),
  );

  return {
    appId: required("FEISHU_APP_ID"),
    appSecret: required("FEISHU_APP_SECRET"),
    pairingCode: process.env.FEISHU_PAIRING_CODE?.trim() || null,
    allowedOpenIds: csv(process.env.FEISHU_ALLOWED_OPEN_IDS),
    allowedGroupChatIds: csv(process.env.FEISHU_ALLOWED_GROUP_CHAT_IDS),
    appServerUrl: assertLocalAppServerUrl(
      process.env.CODEX_APP_SERVER_URL?.trim() || "ws://127.0.0.1:4500",
    ),
    repoRoot,
    statePath,
    sandbox,
  };
}
