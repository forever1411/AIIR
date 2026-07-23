# AIIR Changelog

本文件只记录会改变仓库结构、AIIR 身份或正式运行协议的变更。普通投资讨论和个人决定记录在 `JOURNAL.md` 或后续按需创建的专题文件中。

## 2026-07-23 — Tool-neutral AIIR Assistant

- 将运行角色统一定义为工具中立的 AIIR Assistant。
- 将角色文档重命名为 `docs/AIIR_ASSISTANT_ROLE.md`。
- 新增 `AGENTS.md`，作为 Codex 等本地 AI 代理的自动启动入口。
- 明确 AIIR 会话默认处于讨论模式，仓库修改需要用户明确授权。
- 明确网页 ChatGPT、本地 Codex 和其他成熟模型可以基于同一仓库连续运行 AIIR。

## 2026-07-23 — Initial baseline

- 定义 AIIR 为 GitHub 驱动的个人投资学习、研究与决策辅助系统。
- 定义用户、大模型和 GitHub 仓库之间的职责分工。
- 建立 Vision、模型角色、基本原则和交互协议组成的系统内核。
- 建立启动恢复、当前状态、长期记忆、历史记录和会话收尾机制。
- 规定新的文件、目录和流程只根据真实使用需要创建。
