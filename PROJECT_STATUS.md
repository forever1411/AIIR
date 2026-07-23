# AIIR Project Status

- **Status:** Active
- **Current phase:** ChatGPT-first validation
- **Last updated:** 2026-07-23
- **Dynamic source of truth:** This file

## Current objective

在不开发独立软件的前提下，验证一套主动引导、风险优先、可记录和可复盘的个人投资流程，是否明显优于项目负责人直接与成熟大模型进行临时对话。

## Current deliverable

当前可交付物不是应用，而是：

- 一个配置好的 ChatGPT Project 或等价大模型工作区；
- 一份个人投资教练 Prompt；
- 一组本地私有资料；
- 一套研究、决策和复盘工作流；
- 一份记录真实摩擦的日志；
- 一套与直接聊天进行对照的评估方法。

## Current validation scenarios

至少完成以下三类真实场景：

1. 从零了解一个真实投资标的；
2. 讨论一次与个人情况相关的资产配置问题；
3. 记录并复盘一个真实决定，包括“暂不行动”。

每个场景都应保留脱敏结果、来源、关键未知和摩擦记录。

## Software entry gate

只有同时满足以下条件，才允许进入软件设计：

1. 同一具体摩擦在真实使用中至少重复出现两次；
2. 改进 Prompt、模板或人工流程仍无法低成本解决；
3. 软件化能够明确减少时间、错误、隐私风险或认知负担；
4. 候选功能可以独立交付和评估；
5. 不依赖提前建设完整平台；
6. 项目负责人明确确认值得维护。

没有通过进入门槛时，不创建 `src/`、`tests/`、部署目录、数据库迁移或其他工程骨架。

## Immediate next actions

1. 创建 AIIR 专用 ChatGPT Project；
2. 使用 `prompts/personal_investment_coach.md`；
3. 在 Git 之外建立 `workspace/private/`；
4. 从 `templates/` 复制所需模板；
5. 完成第一个真实场景；
6. 记录与直接聊天相比的增益和摩擦；
7. 在获得真实证据前不扩张架构。

## Explicitly deferred

- 独立 Web 或移动应用；
- 自动行情和新闻监控；
- 多 Agent；
- 知识图谱；
- 多模型投票和自动路由；
- 自动资产配置；
- 券商连接和自动交易；
- 公共发布、商业化和多租户；
- 为假想未来需求建立的代码和部署目录。

## Decision rule

如果成熟大模型加简单文件已经足够解决问题，AIIR 可以长期保持当前形态。这是有效结果，不是项目失败。
