import test from "node:test";
import assert from "node:assert/strict";
import { waitForResumableThread } from "../src/wait-thread.mjs";

test("waitForResumableThread follows a bridge fallback to its persisted ID", async () => {
  const states = [
    { threadId: "thread-stale" },
    { threadId: "thread-ready" },
  ];
  const requests = [];
  const rpc = {
    async request(method, params, timeoutMs) {
      requests.push({ method, params, timeoutMs });
      if (params.threadId === "thread-stale") {
        throw new Error("no rollout found");
      }
      return { thread: { id: "thread-ready" } };
    },
  };

  const threadId = await waitForResumableThread({
    rpc,
    readState: async () => states.shift() ?? { threadId: "thread-ready" },
    sleep: async () => {},
    now: () => 0,
  });

  assert.equal(threadId, "thread-ready");
  assert.deepEqual(
    requests.map(({ method, params }) => [method, params.threadId]),
    [
      ["thread/resume", "thread-stale"],
      ["thread/resume", "thread-ready"],
    ],
  );
});

test("waitForResumableThread reports the last resume failure on timeout", async () => {
  const rpc = {
    async request() {
      throw new Error("no rollout found");
    },
  };

  await assert.rejects(
    waitForResumableThread({
      rpc,
      readState: async () => ({ threadId: "thread-stale" }),
      timeoutMs: 0,
    }),
    /no rollout found/,
  );
});
