import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { CodexSession } from "../src/codex-session.mjs";

class FakeRpc extends EventEmitter {
  constructor() {
    super();
    this.requests = [];
    this.turnCounter = 0;
  }

  async request(method, params) {
    this.requests.push({ method, params });
    if (method === "turn/start") {
      this.turnCounter += 1;
      return { turn: { id: `turn-${this.turnCounter}` } };
    }
    throw new Error(`unexpected request: ${method}`);
  }

  respond() {}

  respondError() {}
}

class ThreadRpc extends EventEmitter {
  constructor(handler) {
    super();
    this.handler = handler;
    this.requests = [];
  }

  async request(method, params) {
    this.requests.push({ method, params });
    return this.handler(method, params);
  }

  respond() {}

  respondError() {}
}

async function completeTurn(rpc, threadId, turnId, text) {
  await new Promise((resolve) => setImmediate(resolve));
  rpc.emit("notification", {
    method: "turn/completed",
    params: {
      threadId,
      turn: {
        id: turnId,
        status: "completed",
        items: [
          {
            type: "agentMessage",
            phase: "final_answer",
            text,
          },
        ],
      },
    },
  });
}

test("write permission applies to one turn and the next turn resets read-only", async () => {
  const rpc = new FakeRpc();
  const state = { threadId: "thread-1" };
  const session = new CodexSession({
    rpc,
    config: { repoRoot: "/workspace", sandbox: "read-only" },
    state,
    persistState: async () => {},
  });

  const writeAnswer = session.ask("修改文件", { writable: true });
  await completeTurn(rpc, "thread-1", "turn-1", "已修改");
  assert.equal(await writeAnswer, "已修改");

  const readAnswer = session.ask("查看状态");
  await completeTurn(rpc, "thread-1", "turn-2", "状态正常");
  assert.equal(await readAnswer, "状态正常");

  const starts = rpc.requests.filter(({ method }) => method === "turn/start");
  assert.equal(starts[0].params.permissions, ":workspace");
  assert.match(
    starts[0].params.additionalContext["aiir.feishu.source"].value,
    /飞书手机端/,
  );
  assert.match(
    starts[0].params.additionalContext["aiir.feishu.permission"].value,
    /WORKSPACE_WRITE/,
  );
  assert.equal(starts[1].params.permissions, ":read-only");
  assert.match(
    starts[1].params.additionalContext["aiir.feishu.permission"].value,
    /READ_ONLY/,
  );
});

test("initializeThread resumes the persisted thread with source-neutral instructions", async () => {
  const state = { threadId: "thread-existing" };
  let persistCount = 0;
  const rpc = new ThreadRpc(async (method, params) => {
    assert.equal(method, "thread/resume");
    assert.doesNotMatch(
      params.developerInstructions,
      /本 turn 来自用户本人的飞书/,
    );
    return { thread: { id: "thread-existing" } };
  });
  const session = new CodexSession({
    rpc,
    config: { repoRoot: "/workspace", sandbox: "read-only" },
    state,
    persistState: async () => {
      persistCount += 1;
    },
  });

  const threadId = await session.initializeThread();

  assert.equal(threadId, "thread-existing");
  assert.equal(rpc.requests.length, 1);
  assert.equal(persistCount, 0);
});

test("initializeThread replaces and persists a thread that cannot resume", async () => {
  const state = { threadId: "thread-missing" };
  let persistCount = 0;
  const rpc = new ThreadRpc(async (method, params) => {
    if (method === "thread/resume") {
      throw new Error("not found");
    }
    if (method === "thread/start") {
      return { thread: { id: "thread-new" } };
    }
    assert.equal(method, "thread/inject_items");
    assert.equal(params.threadId, "thread-new");
    return {};
  });
  const session = new CodexSession({
    rpc,
    config: { repoRoot: "/workspace", sandbox: "read-only" },
    state,
    persistState: async () => {
      persistCount += 1;
    },
  });

  const threadId = await session.initializeThread();

  assert.equal(threadId, "thread-new");
  assert.equal(state.threadId, "thread-new");
  assert.deepEqual(
    rpc.requests.map(({ method }) => method),
    ["thread/resume", "thread/start", "thread/inject_items"],
  );
  assert.equal(persistCount, 1);
});

test("replaceThread starts a clear session and deletes the previous thread", async () => {
  const state = { threadId: "thread-old" };
  let persistCount = 0;
  const rpc = new ThreadRpc(async (method, params) => {
    if (method === "thread/start") {
      assert.equal(params.sessionStartSource, "clear");
      assert.doesNotMatch(
        params.developerInstructions,
        /本 turn 来自用户本人的飞书/,
      );
      return { thread: { id: "thread-new" } };
    }
    if (method === "thread/inject_items") {
      assert.equal(params.threadId, "thread-new");
      assert.equal(params.items[0].type, "message");
      assert.equal(params.items[0].role, "assistant");
      return {};
    }
    assert.equal(method, "thread/delete");
    assert.equal(params.threadId, "thread-old");
    return {};
  });
  const session = new CodexSession({
    rpc,
    config: { repoRoot: "/workspace", sandbox: "read-only" },
    state,
    persistState: async () => {
      persistCount += 1;
    },
  });

  const result = await session.replaceThread({ deletePrevious: true });

  assert.equal(result.threadId, "thread-new");
  assert.equal(result.previousThreadId, "thread-old");
  assert.equal(result.deleteError, null);
  assert.equal(state.threadId, "thread-new");
  assert.equal(persistCount, 1);
  assert.deepEqual(
    rpc.requests.map(({ method }) => method),
    ["thread/start", "thread/inject_items", "thread/delete"],
  );
});

test("replaceThread preserves the previous thread when rollout persistence fails", async () => {
  const state = { threadId: "thread-old" };
  let persistCount = 0;
  const rpc = new ThreadRpc(async (method) => {
    if (method === "thread/start") {
      return { thread: { id: "thread-new" } };
    }
    assert.equal(method, "thread/inject_items");
    throw new Error("rollout write failed");
  });
  const session = new CodexSession({
    rpc,
    config: { repoRoot: "/workspace", sandbox: "read-only" },
    state,
    persistState: async () => {
      persistCount += 1;
    },
  });

  await assert.rejects(
    session.replaceThread({ deletePrevious: true }),
    /rollout write failed/,
  );

  assert.equal(state.threadId, "thread-old");
  assert.equal(persistCount, 0);
  assert.deepEqual(
    rpc.requests.map(({ method }) => method),
    ["thread/start", "thread/inject_items"],
  );
});

test("replaceThread restores the in-memory state when saving the new ID fails", async () => {
  const state = { threadId: "thread-old" };
  const rpc = new ThreadRpc(async (method) => {
    if (method === "thread/start") {
      return { thread: { id: "thread-new" } };
    }
    assert.equal(method, "thread/inject_items");
    return {};
  });
  const session = new CodexSession({
    rpc,
    config: { repoRoot: "/workspace", sandbox: "read-only" },
    state,
    persistState: async () => {
      throw new Error("state write failed");
    },
  });

  await assert.rejects(
    session.replaceThread({ deletePrevious: true }),
    /state write failed/,
  );

  assert.equal(state.threadId, "thread-old");
  assert.deepEqual(
    rpc.requests.map(({ method }) => method),
    ["thread/start", "thread/inject_items"],
  );
});
