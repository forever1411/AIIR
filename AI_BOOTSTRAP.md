# AI_BOOTSTRAP

> **Status：** Active
> **Owner：** Product Owner
> **Last Updated：** 2026-07-22

欢迎加入 AIIR。

本文件是所有 AI 的统一入口，只定义启动顺序与工作规则。

项目的动态状态、当前 Sprint 和下一步任务，统一以 `PROJECT_STATUS.md` 为准，避免多个文档同时维护相同状态。

---

## 一、启动阅读顺序

按以下顺序阅读：

1. `README.md`
2. `PROJECT_CONTEXT.md`
3. `PROJECT_STATUS.md`
4. `docs/00-VISION/` 下的愿景文档
5. `docs/01-GOVERNANCE/CONSTITUTION.md`
6. `docs/03-ARCHITECTURE/` 下与当前任务相关的架构文档

如果进入代码开发，还必须阅读：

7. `CLAUDE.md`
8. 当前功能对应的 PRD、Task、ADR 和验收文档

---

## 二、状态恢复规则

开始任何工作前，必须从 `PROJECT_STATUS.md` 恢复以下信息：

- 当前 Milestone；
- 当前 Sprint；
- 当前重点；
- 已完成事项；
- 正在进行事项；
- 下一步计划；
- 当前风险与约束。

不得根据聊天记录、记忆或旧文档猜测当前状态。

---

## 三、工作原则

- Git 是唯一正式事实来源，聊天不是。
- 不猜测缺失的项目事实。
- 不跳过治理、架构和任务文档。
- 未完成必要设计前，不直接编码。
- 重大架构变化必须形成 ADR。
- 动态状态只维护在 `PROJECT_STATUS.md`。
- 稳定背景只维护在 `PROJECT_CONTEXT.md`。
- 所有输出应遵循 Evidence First、Human Decision 和 Deterministic Before Generative。
