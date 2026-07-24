import { EventEmitter } from "node:events";
import WebSocket from "ws";

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export class CodexRpcClient extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    const socket = new WebSocket(this.url);
    this.socket = socket;
    socket.on("message", (data) => this.#onMessage(data));
    socket.on("error", (error) => this.emit("transportError", error));
    socket.on("close", () => {
      const error = new Error("Codex app-server 连接已关闭");
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(error);
      }
      this.pending.clear();
      this.emit("close");
    });

    await new Promise((resolve, reject) => {
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      const cleanup = () => {
        socket.off("open", onOpen);
        socket.off("error", onError);
      };
      socket.on("open", onOpen);
      socket.on("error", onError);
    });

    await this.request("initialize", {
      clientInfo: {
        name: "aiir_feishu_bridge",
        title: "AIIR Feishu Bridge",
        version: "0.1.0",
      },
      capabilities: {
        experimentalApi: true,
        optOutNotificationMethods: [
          "item/agentMessage/delta",
          "item/reasoning/summaryTextDelta",
          "item/reasoning/textDelta",
          "command/exec/outputDelta",
          "item/commandExecution/outputDelta",
        ],
      },
    });
    this.notify("initialized", {});
  }

  request(method, params, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Codex 请求超时：${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer, method });
    });
    this.#send({ method, id, params });
    return promise;
  }

  notify(method, params) {
    this.#send({ method, params });
  }

  respond(id, result) {
    this.#send({ id, result });
  }

  respondError(id, code, message) {
    this.#send({ id, error: { code, message } });
  }

  close() {
    this.socket?.close();
  }

  #send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Codex app-server 尚未连接");
    }
    this.socket.send(JSON.stringify(message));
  }

  #onMessage(data) {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      this.emit("protocolError", error);
      return;
    }

    if (Object.hasOwn(message, "id") && !message.method) {
      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }
      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      if (message.error) {
        const error = new Error(
          `${pending.method} 失败：${message.error.message ?? "未知错误"}`,
        );
        error.code = message.error.code;
        pending.reject(error);
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (Object.hasOwn(message, "id") && message.method) {
      this.emit("serverRequest", message);
      return;
    }

    if (message.method) {
      this.emit("notification", message);
    }
  }
}
