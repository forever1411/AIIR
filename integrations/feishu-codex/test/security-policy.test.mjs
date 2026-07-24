import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { assertLocalAppServerUrl } from "../src/config.mjs";
import { isGroupSafeCommand } from "../src/commands.mjs";
import { safeErrorMessage, safeLogText } from "../src/safe-log.mjs";
import { loadState, saveState } from "../src/state.mjs";

test("Codex app-server only accepts loopback ws URLs", () => {
  assert.equal(
    assertLocalAppServerUrl("ws://127.0.0.1:4500"),
    "ws://127.0.0.1:4500",
  );
  assert.equal(
    assertLocalAppServerUrl("ws://localhost:4500"),
    "ws://localhost:4500",
  );
  assert.equal(
    assertLocalAppServerUrl("ws://[::1]:4500"),
    "ws://[::1]:4500",
  );
  assert.throws(() => assertLocalAppServerUrl("ws://0.0.0.0:4500"));
  assert.throws(() => assertLocalAppServerUrl("wss://example.com/app-server"));
  assert.throws(() => assertLocalAppServerUrl("ws://user:pass@127.0.0.1:4500"));
});

test("group chats only expose read-only commands", () => {
  assert.equal(isGroupSafeCommand("help"), true);
  assert.equal(isGroupSafeCommand("status"), true);
  assert.equal(isGroupSafeCommand("ask"), true);
  assert.equal(isGroupSafeCommand("write"), false);
  assert.equal(isGroupSafeCommand("thread"), false);
  assert.equal(isGroupSafeCommand("new"), false);
  assert.equal(isGroupSafeCommand("pair"), false);
});

test("logs redact credentials and Feishu or Codex identifiers", () => {
  const message = safeLogText(
    "app_secret=secret-value Bearer token-value " +
      "chat=oc_chat123 sender=ou_user123 thread_id=thread123",
  );
  assert.equal(message.includes("secret-value"), false);
  assert.equal(message.includes("token-value"), false);
  assert.equal(message.includes("oc_chat123"), false);
  assert.equal(message.includes("ou_user123"), false);
  assert.equal(message.includes("thread123"), false);
  assert.match(message, /\[REDACTED/);
  assert.equal(
    safeErrorMessage(new Error("turn_id=turn123 failed")),
    "turn_id=[REDACTED_ID] failed",
  );
});

test("legacy state does not reuse an unknown last chat as notification target", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "aiir-feishu-state-"));
  const statePath = path.join(directory, "state.json");
  await fs.writeFile(
    statePath,
    JSON.stringify({
      version: 1,
      threadId: "thread-1",
      pairedOpenIds: ["ou_user"],
      lastChatId: "oc_unknown_chat",
    }),
  );

  const state = await loadState(statePath);
  assert.equal(state.version, 2);
  assert.equal(state.notificationChatId, null);
  assert.deepEqual(state.recentMessageIds, []);

  state.notificationChatId = "oc_private_chat";
  state.recentMessageIds = Array.from({ length: 205 }, (_, index) => `m${index}`);
  await saveState(statePath, state);
  const persisted = JSON.parse(await fs.readFile(statePath, "utf8"));
  assert.equal("lastChatId" in persisted, false);
  assert.equal(persisted.notificationChatId, "oc_private_chat");
  assert.equal(persisted.recentMessageIds.length, 200);
});
