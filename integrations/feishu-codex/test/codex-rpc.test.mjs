import test from "node:test";
import assert from "node:assert/strict";
import { WebSocketServer } from "ws";
import { CodexRpcClient } from "../src/codex-rpc.mjs";

test("CodexRpcClient completes the app-server handshake", async (context) => {
  const server = new WebSocketServer({ port: 0, host: "127.0.0.1" });
  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
  } catch (error) {
    if (["EACCES", "EPERM"].includes(error.code)) {
      context.skip("当前运行环境不允许监听本地测试端口");
      return;
    }
    throw error;
  }
  let client;
  let initializeCapabilities;
  context.after(async () => {
    client?.close();
    await new Promise((resolve) => server.close(resolve));
  });

  let initialized = false;
  server.on("connection", (socket) => {
    socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.method === "initialize") {
        initializeCapabilities = message.params.capabilities;
        socket.send(
          JSON.stringify({
            id: message.id,
            result: {
              userAgent: "test",
              codexHome: "/tmp/test",
              platformFamily: "unix",
              platformOs: "linux",
            },
          }),
        );
      } else if (message.method === "initialized") {
        initialized = true;
      } else if (message.method === "thread/start") {
        socket.send(
          JSON.stringify({
            id: message.id,
            result: { thread: { id: "thread-test" } },
          }),
        );
      }
    });
  });

  const { port } = server.address();
  client = new CodexRpcClient(`ws://127.0.0.1:${port}`);
  await client.connect();
  const result = await client.request("thread/start", {});

  assert.equal(initialized, true);
  assert.equal(initializeCapabilities.experimentalApi, true);
  assert.equal(result.thread.id, "thread-test");
});
