export const DEFAULT_SLOW_RESPONSE_MS = 15 * 60_000;
export const DEFAULT_MARKDOWN_CHUNK_LIMIT = 3_000;

const FENCE_PATTERN = /^```([A-Za-z0-9_+.-]{0,64})\s*$/;

function splitByCodeUnits(text, limit) {
  const parts = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + limit, text.length);
    if (
      end < text.length &&
      end > start &&
      /[\uD800-\uDBFF]/.test(text[end - 1]) &&
      /[\uDC00-\uDFFF]/.test(text[end])
    ) {
      end -= 1;
    }
    parts.push(text.slice(start, end));
    start = end;
  }
  return parts.length > 0 ? parts : [""];
}

function hardWrapLongLines(text, limit) {
  return text
    .split("\n")
    .flatMap((line) =>
      line.length <= limit ? [line] : splitByCodeUnits(line, limit),
    );
}

/**
 * Split Markdown into independently renderable chunks.
 *
 * Each chunk remains within `limit`, including temporary closing/reopening
 * fences. Long individual lines are hard-wrapped so they cannot bypass the
 * chunk limit.
 */
export function splitMarkdown(text, limit = DEFAULT_MARKDOWN_CHUNK_LIMIT) {
  if (!Number.isInteger(limit) || limit < 100) {
    throw new Error("Markdown 分段上限必须是至少 100 的整数");
  }

  const markdown = String(text ?? "");
  if (markdown.length <= limit) {
    return [markdown];
  }

  // Leave room for a reopened language fence, a newline and a closing fence.
  const lines = hardWrapLongLines(markdown, limit - 80);
  const chunks = [];
  let buffer = [];
  let bufferLength = 0;
  let fenceLanguage = null;

  const flush = () => {
    if (buffer.length === 0) {
      return;
    }

    let chunk = buffer.join("\n");
    if (fenceLanguage !== null) {
      chunk += "\n```";
    }
    if (chunk.length > limit) {
      throw new Error("Markdown 分段超过内部安全上限");
    }
    chunks.push(chunk);

    buffer =
      fenceLanguage === null ? [] : [`\`\`\`${fenceLanguage}`];
    bufferLength = buffer.length === 0 ? 0 : buffer[0].length;
  };

  for (const line of lines) {
    const fenceMatch = line.match(FENCE_PATTERN);
    const nextFenceLanguage = fenceMatch
      ? fenceLanguage === null
        ? fenceMatch[1] || ""
        : null
      : fenceLanguage;
    const separatorLength = buffer.length > 0 ? 1 : 0;
    const closingFenceLength = nextFenceLanguage === null ? 0 : 4;
    const isHeading = /^#{1,6}\s/.test(line);
    const nearFull = bufferLength > limit * 0.75;

    if (
      buffer.length > 0 &&
      (bufferLength +
        separatorLength +
        line.length +
        closingFenceLength >
        limit ||
        (isHeading && nearFull))
    ) {
      flush();
    }

    const actualSeparatorLength = buffer.length > 0 ? 1 : 0;
    buffer.push(line);
    bufferLength += actualSeparatorLength + line.length;
    if (fenceMatch) {
      fenceLanguage =
        fenceLanguage === null ? fenceMatch[1] || "" : null;
    }
  }

  flush();
  return chunks;
}

export class ReplyDeliveryError extends Error {
  constructor(cause, { sentChunks, totalChunks }) {
    super(
      `飞书回复发送到第 ${sentChunks + 1}/${totalChunks} 段时失败`,
      { cause },
    );
    this.name = "ReplyDeliveryError";
    this.sentChunks = sentChunks;
    this.totalChunks = totalChunks;
  }
}

export async function sendMarkdownReply(
  channel,
  message,
  text,
  { chunkLimit = DEFAULT_MARKDOWN_CHUNK_LIMIT } = {},
) {
  const chunks = splitMarkdown(text, chunkLimit);
  const results = [];

  for (let index = 0; index < chunks.length; index += 1) {
    try {
      results.push(
        await channel.send(
          message.chatId,
          { markdown: chunks[index] },
          index === 0 ? { replyTo: message.messageId } : {},
        ),
      );
    } catch (error) {
      throw new ReplyDeliveryError(error, {
        sentChunks: index,
        totalChunks: chunks.length,
      });
    }
  }

  return { chunks: chunks.length, results };
}

export async function waitForTurnOrSlow(
  answerPromise,
  slowResponseMs = DEFAULT_SLOW_RESPONSE_MS,
) {
  if (!Number.isFinite(slowResponseMs) || slowResponseMs < 0) {
    throw new Error("慢响应等待时间必须是非负有限数值");
  }

  const completion = Promise.resolve(answerPromise).then(
    (answer) => ({ kind: "answer", answer }),
    (error) => ({ kind: "error", error }),
  );

  let timer;
  const slow = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ kind: "slow" }), slowResponseMs);
  });
  const first = await Promise.race([completion, slow]);
  clearTimeout(timer);

  if (first.kind === "slow") {
    return { slow: true, completion };
  }
  return { slow: false, outcome: first };
}
