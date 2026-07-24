import fs from "node:fs/promises";
import path from "node:path";

const EMPTY_STATE = Object.freeze({
  version: 1,
  threadId: null,
  pairedOpenIds: [],
  lastChatId: null,
});

export async function loadState(statePath) {
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_STATE,
      ...parsed,
      pairedOpenIds: Array.isArray(parsed.pairedOpenIds)
        ? parsed.pairedOpenIds.filter((item) => typeof item === "string")
        : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...EMPTY_STATE, pairedOpenIds: [] };
    }
    throw error;
  }
}

export async function saveState(statePath, state) {
  await fs.mkdir(path.dirname(statePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${statePath}.tmp.${process.pid}`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await fs.rename(temporaryPath, statePath);
  await fs.chmod(statePath, 0o600);
}
