import fs from "node:fs/promises";
import path from "node:path";

const EMPTY_STATE = Object.freeze({
  version: 2,
  threadId: null,
  pairedOpenIds: [],
  notificationChatId: null,
  recentMessageIds: [],
});

export async function loadState(statePath) {
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_STATE,
      ...parsed,
      version: 2,
      pairedOpenIds: Array.isArray(parsed.pairedOpenIds)
        ? parsed.pairedOpenIds.filter((item) => typeof item === "string")
        : [],
      notificationChatId:
        parsed.version >= 2 && typeof parsed.notificationChatId === "string"
          ? parsed.notificationChatId
          : null,
      recentMessageIds: Array.isArray(parsed.recentMessageIds)
        ? parsed.recentMessageIds
            .filter((item) => typeof item === "string")
            .slice(-200)
        : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...EMPTY_STATE, pairedOpenIds: [], recentMessageIds: [] };
    }
    throw error;
  }
}

export async function saveState(statePath, state) {
  const persistedState = { ...state, version: 2 };
  delete persistedState.lastChatId;
  persistedState.recentMessageIds = (
    persistedState.recentMessageIds ?? []
  ).slice(-200);

  await fs.mkdir(path.dirname(statePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${statePath}.tmp.${process.pid}`;
  await fs.writeFile(
    temporaryPath,
    `${JSON.stringify(persistedState, null, 2)}\n`,
    {
      encoding: "utf8",
      mode: 0o600,
    },
  );
  await fs.rename(temporaryPath, statePath);
  await fs.chmod(statePath, 0o600);
}
