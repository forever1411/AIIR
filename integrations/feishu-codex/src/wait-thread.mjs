import { pathToFileURL } from "node:url";
import { loadConfig } from "./config.mjs";
import { CodexRpcClient } from "./codex-rpc.mjs";
import { safeErrorMessage } from "./safe-log.mjs";
import { loadState } from "./state.mjs";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 200;
const THREAD_RESUME_TIMEOUT_MS = 2_000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForResumableThread({
  rpc,
  readState,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  sleep = delay,
  now = Date.now,
}) {
  const startedAt = now();
  let lastError = null;

  while (true) {
    const state = await readState();
    if (state.threadId) {
      try {
        await rpc.request(
          "thread/resume",
          {
            threadId: state.threadId,
          },
          THREAD_RESUME_TIMEOUT_MS,
        );
        return state.threadId;
      } catch (error) {
        lastError = error;
      }
    }

    if (now() - startedAt >= timeoutMs) {
      const detail = lastError
        ? `：${safeErrorMessage(lastError)}`
        : "：状态文件中没有 threadId";
      throw new Error(`等待可恢复的 Codex thread 超时${detail}`);
    }
    await sleep(pollIntervalMs);
  }
}

async function main() {
  const config = loadConfig();
  const rpc = new CodexRpcClient(config.appServerUrl);
  await rpc.connect();
  try {
    const threadId = await waitForResumableThread({
      rpc,
      readState: () => loadState(config.statePath),
    });
    process.stdout.write(threadId);
  } finally {
    rpc.close();
  }
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    console.error(safeErrorMessage(error));
    process.exitCode = 1;
  });
}
