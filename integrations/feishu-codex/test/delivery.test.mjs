import test from "node:test";
import assert from "node:assert/strict";
import {
  ReplyDeliveryError,
  sendMarkdownReply,
  splitMarkdown,
  waitForTurnOrSlow,
} from "../src/delivery.mjs";

test("splitMarkdown hard-wraps a single overlong line", () => {
  const chunks = splitMarkdown("甲".repeat(8_000), 1_000);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 1_000));
  assert.equal(chunks.join("\n").replaceAll("\n", ""), "甲".repeat(8_000));
});

test("splitMarkdown closes and reopens fenced code blocks", () => {
  const markdown = [
    "```javascript",
    ...Array.from({ length: 40 }, (_, index) =>
      `console.log(${index}, "${"值".repeat(30)}");`,
    ),
    "```",
  ].join("\n");
  const chunks = splitMarkdown(markdown, 300);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 300));
  assert.ok(chunks.slice(0, -1).every((chunk) => chunk.endsWith("\n```")));
  assert.ok(
    chunks.slice(1).every((chunk) => chunk.startsWith("```javascript\n")),
  );
});

test("sendMarkdownReply sends chunks in order and only replies with the first", async () => {
  const calls = [];
  const channel = {
    async send(chatId, input, options) {
      calls.push({ chatId, input, options });
      return { messageId: `message-${calls.length}` };
    },
  };

  const result = await sendMarkdownReply(
    channel,
    { chatId: "chat-1", messageId: "source-1" },
    "甲".repeat(3_000),
    { chunkLimit: 500 },
  );

  assert.equal(result.chunks, calls.length);
  assert.ok(calls.length > 1);
  assert.deepEqual(calls[0].options, { replyTo: "source-1" });
  assert.ok(calls.slice(1).every(({ options }) => !options.replyTo));
  assert.ok(
    calls.every(({ input }) => input.markdown.length <= 500),
  );
});

test("sendMarkdownReply reports partial delivery without retrying earlier chunks", async () => {
  let callCount = 0;
  const channel = {
    async send() {
      callCount += 1;
      if (callCount === 3) {
        throw new Error("network unavailable");
      }
      return { messageId: `message-${callCount}` };
    },
  };

  await assert.rejects(
    sendMarkdownReply(
      channel,
      { chatId: "chat-1", messageId: "source-1" },
      "甲".repeat(3_000),
      { chunkLimit: 500 },
    ),
    (error) => {
      assert.ok(error instanceof ReplyDeliveryError);
      assert.equal(error.sentChunks, 2);
      assert.ok(error.totalChunks > error.sentChunks);
      return true;
    },
  );
  assert.equal(callCount, 3);
});

test("waitForTurnOrSlow returns a fast final answer directly", async () => {
  const result = await waitForTurnOrSlow(Promise.resolve("完成"), 100);

  assert.equal(result.slow, false);
  assert.deepEqual(result.outcome, { kind: "answer", answer: "完成" });
});

test("waitForTurnOrSlow keeps a late final answer available", async () => {
  let resolveAnswer;
  const answer = new Promise((resolve) => {
    resolveAnswer = resolve;
  });

  const result = await waitForTurnOrSlow(answer, 5);
  assert.equal(result.slow, true);

  resolveAnswer("迟到的最终答案");
  assert.deepEqual(await result.completion, {
    kind: "answer",
    answer: "迟到的最终答案",
  });
});
