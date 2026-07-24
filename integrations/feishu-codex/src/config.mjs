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
  if (!["read-only", "workspace-write"].includes(sandbox)) {
    throw new Error(
      "FEISHU_CODEX_SANDBOX 只能是 read-only 或 workspace-write",
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
    appServerUrl:
      process.env.CODEX_APP_SERVER_URL?.trim() || "ws://127.0.0.1:4500",
    repoRoot,
    statePath,
    sandbox,
  };
}
