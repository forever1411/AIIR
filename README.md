# AIIR

**AIIR — AI Investment Reflection**

AIIR 是一个面向项目负责人个人使用的投资学习与决策系统。它当前不是独立投资软件，也不试图比 ChatGPT、Claude、Gemini 等成熟大模型更聪明。

AIIR 的当前做法是：先把成熟大模型组织成一套可靠、低摩擦、可复盘的个人投资流程，再通过真实使用判断哪些重复问题值得软件化。

## AIIR 解决什么问题

项目负责人目前投资经验有限，真正的困难通常不是“模型不会回答”，而是：

- 不知道应该从哪里开始；
- 不知道应该问什么；
- 不知道应该查哪些可靠资料；
- 难以判断事实、推断和营销话术；
- 不知道做决定前还缺什么；
- 容易受到价格波动、确认偏误和情绪影响；
- 很难保存并复盘当时为什么做出决定。

AIIR 应主动生成研究问题、解释资料、检查风险、记录决定并支持复盘，而不是要求用户先成为专业投资者。

## 当前形态：ChatGPT-first Pilot

当前版本由以下内容组成：

```text
ChatGPT Project 或其他成熟大模型工作区
+ AIIR 教练 Prompt
+ 私有个人资料模板
+ 标准工作流
+ 对照评估与摩擦日志
```

仓库当前不包含应用代码、数据库、部署配置或提前搭建的工程骨架。只有在真实使用证明存在稳定且值得自动化的缺口后，才创建对应的软件设计与代码目录。

## 立即开始

1. 阅读 [项目愿景](docs/VISION.md) 和 [原则与安全边界](docs/PRINCIPLES.md)。
2. 按 [试点说明](docs/PILOT.md) 创建一个 ChatGPT Project。
3. 将 [`prompts/personal_investment_coach.md`](prompts/personal_investment_coach.md) 设为项目指令。
4. 将 [`templates/`](templates/) 中的示例复制到本地私有目录并填写真实信息。
5. 按 [标准工作流](docs/WORKFLOWS.md) 完成真实研究、决策或复盘。
6. 用 [评估规则](docs/EVALUATION.md) 比较 AIIR 流程与直接聊天的差异。

## 当前成功标准

AIIR 不以短期收益或“回答听起来多专业”作为成功标准。当前阶段只验证：

- 是否帮助用户提出原本不知道该问的问题；
- 是否更容易找到并理解可靠来源；
- 是否更清楚地暴露未知、风险和反方证据；
- 是否减少重复整理上下文；
- 是否提高决策记录和事后复盘质量；
- 是否相对直接使用成熟大模型产生可观察的实际增益。

## 安全边界

AIIR：

- 不承诺收益或资本保值；
- 不把模型语言能力等同于真实投资经验；
- 不替用户作最终决定；
- 不自动下单或连接券商；
- 不把每条新闻和价格波动转化为交易信号；
- 在高风险、税务、法律或复杂产品场景中建议寻求合格专业人士复核。

## 仓库结构

```text
AIIR/
├── README.md
├── PROJECT_STATUS.md
├── AI_BOOTSTRAP.md
├── DEVELOPMENT_AGENT.md
├── docs/
│   ├── VISION.md
│   ├── PRINCIPLES.md
│   ├── PILOT.md
│   ├── WORKFLOWS.md
│   └── EVALUATION.md
├── prompts/
│   ├── personal_investment_coach.md
│   ├── company_research.md
│   ├── asset_allocation_discussion.md
│   ├── news_impact.md
│   └── decision_review.md
└── templates/
    ├── README.md
    ├── investment_profile.example.md
    ├── portfolio.example.csv
    ├── watchlist.example.csv
    ├── investment_rules.example.md
    ├── decision_journal.example.md
    └── friction_log.example.md
```

仓库保持小而真实。未来目录在真正产生内容时再创建，不使用 `.gitkeep` 预占结构。
