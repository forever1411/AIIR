import { loadConfig } from "./config.mjs";
import { CodexRpcClient } from "./codex-rpc.mjs";
import { CodexSession } from "./codex-session.mjs";
import { safeErrorMessage } from "./safe-log.mjs";
import { loadState, saveState } from "./state.mjs";

const config = loadConfig();
const state = await loadState(config.statePath);
const persistState = () => saveState(config.statePath, state);
const rpc = new CodexRpcClient(config.appServerUrl);

await rpc.connect();
try {
  const session = new CodexSession({ rpc, config, state, persistState });
  const { threadId, previousThreadId, deleteError } =
    await session.replaceThread({ deletePrevious: true });

  if (deleteError) {
    console.warn(
      `新 thread 已启用，但旧 thread 删除失败：${safeErrorMessage(deleteError)}`,
    );
  } else if (previousThreadId) {
    console.warn("旧 Codex thread 已删除");
  }

  process.stdout.write(threadId);
} finally {
  rpc.close();
}
