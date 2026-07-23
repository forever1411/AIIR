# AIIR

> **AI Investment Reflection**
> 一个以成熟大模型为分析引擎、以个人事实和决策记录为长期资产的个人投资学习与决策系统。

## 为什么重新开始

AIIR 最初被设想为一个大而全的 AI 投资研究平台：自动收集新闻、阅读财报、分析市场、生成报告，像一位拥有几十年经验的财经专家。

这个愿景的问题不是缺乏吸引力，而是它掩盖了两个事实：

1. ChatGPT 等成熟大模型已经能够很好地完成检索、解释、研究和讨论；
2. 项目负责人当前真正缺少的，是一套能够主动引导学习、提出正确问题、组织可靠资料、约束决策并支持复盘的流程。

因此，AIIR 不再以“造一个比 ChatGPT 更强的投资专家”为目标。

AIIR 的新目标是：

> **先用成熟大模型完成能够完成的工作，再把个人长期上下文、固定研究流程、确定性计算、决策日志和真实使用中反复出现的摩擦，逐步沉淀为一个本地工具。**

## AIIR 现在是什么

AIIR 当前首先是一套 **ChatGPT-first 的个人投资操作系统**，由三部分组成：

1. **投资教练**：当用户不知道该问什么时，主动识别问题、补全研究步骤并解释下一步；
2. **个人上下文**：保存投资目标、风险约束、持仓、观察名单、规则和决策历史；
3. **验证机制**：通过真实使用比较“直接使用成熟大模型”和“使用 AIIR 流程”的差异，只自动化被证明有价值的部分。

AIIR 未来可能包含软件，但软件不是项目成立的前提，也不是当前阶段的默认答案。

## AIIR 不是什么

AIIR 不是：

- 自动交易系统；
- 收益保证系统；
- 股票推荐机器人；
- 替代持牌专业人士的受托顾问；
- 模拟权威口吻后替用户拍板的“专家”；
- 为了技术展示而构建的多 Agent 平台；
- 与 ChatGPT、Claude、Gemini 等基础模型竞争的产品。

## 当前最重要的问题

当前项目只验证一个问题：

> **一套主动引导、保存个人上下文并要求决策复盘的流程，是否能明显改善项目负责人使用成熟大模型进行投资学习和决策准备的体验？**

在这个问题被真实使用验证之前，不启动完整平台开发。

## 当前阶段

**Phase 0：ChatGPT-first Pilot**

当前工作：

- 建立一个专用 ChatGPT Project；
- 使用仓库中的系统提示和个人数据模板；
- 完成至少三个真实场景；
- 记录直接使用 ChatGPT 时和使用 AIIR 流程时的差异；
- 只把稳定、重复、容易出错的摩擦列入软件候选范围。

详见：

- [文档地图](docs/README.md)
- [项目状态](PROJECT_STATUS.md)
- [愿景](docs/00-VISION/00-VISION.md)
- [路线图](docs/02-ROADMAP/ROADMAP.md)
- [ChatGPT-first 试点](docs/04-PRODUCT/CHATGPT_FIRST_PILOT.md)
- [AIIR V0 规格](docs/04-PRODUCT/AIIR_V0_SPEC.md)

## 立即开始

1. 在 ChatGPT 中创建一个名为 `AIIR Personal Investing` 的 Project；
2. 将 [`prompts/system/personal_investment_coach.md`](prompts/system/personal_investment_coach.md) 设为项目指令；
3. 复制 `data/templates/` 下的模板到一个**不提交到 Git**的私有目录；
4. 先完成投资背景和风险约束，而不是立即研究个股；
5. 选择一个真实问题，按引导研究流程运行；
6. 将每次重复、不便或不可靠之处写入 `friction_log`。

## 成功标准

AIIR 的成功不以短期收益或报告数量衡量，而以以下变化衡量：

- 用户越来越知道下一步应该了解什么；
- 模糊问题可以被系统转化为合理的研究计划；
- 重要结论能区分事实、推断和未知；
- 决策前能主动发现缺失信息、集中风险和确认偏误；
- 数月后仍能还原当时为什么做出决定；
- 系统减少重复整理和信息焦虑，而不是诱发更多交易；
- 软件开发只发生在成熟工具无法可靠解决的地方。

## 开发原则

- ChatGPT First
- User Learning First
- Risk Before Return
- Evidence Before Confidence
- Questions Before Answers
- Deterministic Before Generative
- Local and Private by Default
- Validate Before Automate
- One User, One Real Workflow
- Git is the Source of Truth

## 免责声明

AIIR 是个人学习和决策准备工具，不构成投资、法律、税务或会计建议。模型可能遗漏、误解或编造信息。用户必须核对重要事实，并对最终决定承担责任。
