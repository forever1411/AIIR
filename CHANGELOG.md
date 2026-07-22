# CHANGELOG

本文件记录 AIIR 项目正式版本和重要架构演进。

格式参考 Keep a Changelog，版本号遵循语义化版本原则。

---

## [Unreleased]

### Added

* 新增工具无关的 `DEVELOPMENT_AGENT.md` 作为本地开发规则唯一来源；
* 新增 `AGENTS.md` 作为 Codex 与通用 Agent 自动发现入口；
* 将 `CLAUDE.md` 缩减为 Claude Code 兼容入口，避免维护厂商专属规则副本；
* 规划统一的 LLM Gateway；
* 规划模型 Provider Adapter 接口；
* 规划 Research Workflow Engine；
* 规划 Evidence 与 Citation 层；
* 规划 Prompt 运行时目录；
* 规划 LLM Evaluation 测试体系；
* 规划模型调用审计、成本统计和结果校验能力。

### Changed

* 明确 AIIR 不是单纯的数据采集工具，而是数据、知识、研究工作流、大模型推理和证据治理共同组成的投资研究系统；
* 明确 AIIR 的分析、解读和讨论能力需要由大模型提供；
* 明确业务模块不得直接依赖 OpenAI、Anthropic、Gemini 等模型厂商 SDK；
* 明确所有模型调用必须通过统一 LLM Gateway；
* 明确 MVP 仅实现一个模型 Provider，多模型路由延后；
* 明确财务计算、公式计算、数据验证和来源管理由确定性程序完成；
* 明确 Prompt 应外置、版本化并接受测试；
* 明确模型输出必须采用结构化 Schema 并经过验证；
* 明确 Evidence 与 Citation 是 AIIR 核心架构能力；
* 调整系统架构设计优先级，当前工作重点由普通 Roadmap 编写转向总体架构与 LLM 架构；
* 更新建议源码结构，新增 `workflows`、`llm`、`evidence`、`knowledge` 和 `evaluation` 等模块；
* 将本地开发规则迁移到工具无关的 `DEVELOPMENT_AGENT.md`，并增加 `AGENTS.md` 与 `CLAUDE.md` 兼容入口；
* 更新 `PROJECT_STATUS.md`，记录新的架构认识和后续计划。

### Deprecated

* 不再建议在业务 Agent 或 Workflow 内直接初始化模型厂商 Client；
* 不再建议将 Prompt 字符串散落在业务代码中；
* 不再建议由大模型承担可以通过程序准确完成的计算任务。

### Fixed

* 修正了对 AIIR 程序形态的早期模糊认识；
* 修正了将“Agent 数量”视为系统核心的倾向，明确 Workflow、Evidence 和 LLM Gateway 更基础；
* 修正了仅关注信息采集、忽略模型运行时能力的架构缺口。

---

## [0.1.0] - 2026-07-22

### 项目初始化

AIIR 项目正式建立，完成首批项目基础和治理文档。

### Added

#### 项目基础

* 初始化 AIIR GitHub 仓库；
* 建立项目基础目录；
* 建立 Git 版本管理；
* 建立文档目录体系。

#### 项目入口和状态

新增：

* `README.md`；
* `PROJECT_CONTEXT.md`；
* `PROJECT_STATUS.md`；
* `CHANGELOG.md`。

#### AI 协作

新增：

* 初始本地编程代理规则文件；
* Product Owner、Chief Architect 和本地编程代理的协作分工；
* 文档驱动开发工作流；
* 架构评审与最终验收流程。

#### 产品设计

完成：

* `00-VISION.md`；
* `CONSTITUTION.md`。

#### 项目原则

建立：

* Design First；
* Documentation First；
* Evidence First；
* Human Decision；
* Git is the Source of Truth；
* Architecture Driven；
* Keep It Simple。

#### 产品定位

正式确定：

AIIR 是一个 AI Investment Research Platform。

AIIR 不是：

* 股票推荐工具；
* 自动交易工具；
* 自动下单系统；
* AI 炒股机器人；
* 收益保证系统。

AIIR 的目标是：

通过信息、证据、知识、推理、讨论和复盘，帮助用户提升投资认知和研究能力，辅助用户实现长期、稳健的财富增长。

---

## 下一版本规划

下一版本计划完成：

* 总体系统架构；
* LLM 架构；
* Research Workflow 架构；
* Evidence 架构；
* 产品 Roadmap；
* 技术栈；
* MVP 模型 Provider 策略；
* V0.1 MVP 范围冻结；
* 第一份 PRD 与开发 Task。
