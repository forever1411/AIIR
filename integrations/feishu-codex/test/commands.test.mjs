import test from "node:test";
import assert from "node:assert/strict";
import { pairingMatches, parseCommand } from "../src/commands.mjs";

test("direct message becomes an ask command", () => {
  assert.deepEqual(parseCommand(" 帮我看一下今天的风险 "), {
    name: "ask",
    argument: "帮我看一下今天的风险",
    explicit: false,
  });
});

test("explicit ask command keeps its argument", () => {
  assert.deepEqual(parseCommand("/aiir ask 解释一下缩量下跌"), {
    name: "ask",
    argument: "解释一下缩量下跌",
    explicit: true,
  });
});

test("write command is explicit and keeps its task", () => {
  assert.deepEqual(parseCommand("/aiir write 更新 README 并运行测试"), {
    name: "write",
    argument: "更新 README 并运行测试",
    explicit: true,
  });
});

test("bare aiir command opens help", () => {
  assert.deepEqual(parseCommand("/AIIR"), {
    name: "help",
    argument: "",
    explicit: true,
  });
});

test("pairing comparison is exact", () => {
  assert.equal(pairingMatches("secret-12345678", "secret-12345678"), true);
  assert.equal(pairingMatches("secret-12345678", "secret-12345679"), false);
  assert.equal(pairingMatches(null, "secret-12345678"), false);
});
