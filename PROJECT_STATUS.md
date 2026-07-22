# AIIR 项目状态（PROJECT_STATUS）

> **Project：** AIIR（AI Investment Research）
> **Version：** v0.1
> **Status：** Active
> **Owner：** Product Owner
> **Last Updated：** 2026-07-22
> **Dynamic State Source：** 本文件是项目唯一动态状态源

---

## 一、项目总体状态

| 项目        | 当前状态                           |
| --------- | ------------------------------ |
| 项目阶段      | Milestone 0：Project Foundation |
| 当前 Sprint | Sprint 0.2：System Architecture |
| 项目状态      | 正常进行                           |
| 当前重点      | 总体系统架构、MVP 边界与 Evidence 核心模型      |
| 总体完成度     | 约 25%                          |
| 业务代码状态    | 尚未开始                           |

---

## 二、项目定位

AIIR 是一个以 AI 为核心的专业投资研究平台（AI Investment Research Platform）。

AIIR 通过以下能力协同工作：

1. 数据采集与处理；
2. 投资知识与长期记忆；
3. 结构化研究工作流；
4. 大模型理解与推理；
5. 证据引用与结果验证；
6. 用户讨论与决策支持。

AIIR 的目标不是替用户完成投资，而是帮助用户建立更加专业、全面和理性的投资研究能力，持续提升投资认知，辅助用户实现长期、稳健的资产保值增值。

---

## 三、AIIR 的系统本质

AIIR 不是单纯的信息采集程序，也不是单纯的大模型聊天工具。

AIIR 的完整能力由以下部分共同组成：

```text
AIIR
=
数据采集系统
+
数据处理与计算系统
+
投资知识与记忆系统
+
研究工作流系统
+
大模型推理系统
+
证据与验证系统
+
用户决策支持系统
```

其中：

* 普通程序负责数据采集、清洗、存储、计算、校验和调度；
* 大模型负责文本理解、知识关联、风险识别、逻辑分析和研究讨论；
* 知识库负责保存专业知识、历史研究和长期上下文；
* Evidence 层负责把结论与来源、事实和证据绑定；
* 用户负责最终投资决策。

---

## 四、当前 Milestone

### Milestone 0：Project Foundation

**目标：**

建立 AIIR 的产品基础、治理体系、架构体系、技术原则和 MVP 开发依据。

**当前状态：**

进行中。

**完成条件：**

* 项目愿景明确；
* 项目边界明确；
* 项目治理原则明确；
* 总体系统架构确定；
* LLM 架构确定；
* 数据与 Evidence 架构确定；
* 技术栈确定；
* MVP 范围冻结；
* 第一份 PRD 和 Task 可以交付 Claude Code。

---

## 五、当前 Sprint

### Sprint 0.2：System Architecture

**当前目标：**

明确 AIIR 作为“数据、知识、工作流与大模型协作系统”的总体架构。

**本 Sprint 重点：**

* 完成 `SYSTEM_ARCHITECTURE.md`；
* 完成 `LLM_ARCHITECTURE.md`；
* 完成 `RESEARCH_WORKFLOW_ARCHITECTURE.md`；
* 完成 `EVIDENCE_ARCHITECTURE.md`；
* 明确确定性程序与生成式模型的职责边界；
* 明确 MVP 的模型接入原则；
* 为后续技术选型提供依据。

---

## 六、已完成事项

### 6.1 项目基础

* [x] AIIR 项目正式命名；
* [x] GitHub 仓库建立；
* [x] 项目基础目录建立；
* [x] Git 版本管理初始化。

### 6.2 项目定位与治理

* [x] 明确 AIIR 的产品定位；
* [x] 明确 AIIR 的长期目标；
* [x] 明确用户拥有最终决策权；
* [x] 明确 AIIR 不进行自动交易和自动下单；
* [x] 建立文档驱动开发原则；
* [x] 建立 Git 作为唯一事实来源的原则。

### 6.3 已完成文档

* [x] `README.md`；
* [x] `PROJECT_CONTEXT.md`；
* [x] `PROJECT_STATUS.md`；
* [x] `CHANGELOG.md`；
* [x] `CLAUDE.md`；
* [x] `00-VISION.md`；
* [x] `CONSTITUTION.md`。

### 6.4 新形成的架构认识

* [x] 明确 AIIR 的分析与解读能力需要依赖大模型；
* [x] 明确 AIIR 必须建立统一的 LLM Gateway；
* [x] 明确业务模块不得直接绑定单一模型厂商；
* [x] 明确模型 Provider 采用统一 Adapter 接口；
* [x] 明确 MVP 只实现一个模型 Provider；
* [x] 明确多模型路由不进入首个 MVP；
* [x] 明确数值计算、公式计算和数据校验必须由确定性程序完成；
* [x] 明确 Prompt 不应硬编码在业务代码中；
* [x] 明确模型输出必须经过结构化校验；
* [x] 明确需要建立 Evidence 与 LLM Evaluation 能力。

---

## 七、正在进行

* [x] 完成 `SYSTEM_ARCHITECTURE.md` Proposed 初稿；
* [x] 确定 AIIR V0.1 核心模块及边界；
* [x] 确定 LLM Gateway 的最小职责和接口边界；
* [ ] 细化 Research Workflow 阶段、输入输出与重试规则；
* [ ] 细化 Evidence、Citation 与 Claim Validation 机制。

---

## 八、待完成事项

### 8.1 架构文档

* [x] `SYSTEM_ARCHITECTURE.md`（Proposed，待 ADR 与 Product Owner 批准）；
* [ ] `LLM_ARCHITECTURE.md`；
* [ ] `RESEARCH_WORKFLOW_ARCHITECTURE.md`；
* [ ] `EVIDENCE_ARCHITECTURE.md`；
* [ ] `AGENT_ARCHITECTURE.md`；
* [ ] `MEMORY_ARCHITECTURE.md`；
* [ ] `DATA_ARCHITECTURE.md`。

### 8.2 技术设计

* [ ] `TECH_STACK.md`；
* [ ] `MODEL_PROVIDER_STRATEGY.md`；
* [ ] `DEVELOPMENT_ENVIRONMENT.md`；
* [ ] `PROMPT_ARCHITECTURE.md`；
* [ ] `LLM_EVALUATION_STRATEGY.md`；
* [ ] `TEST_STRATEGY.md`。

### 8.3 产品规划

* [ ] `ROADMAP.md`；
* [ ] 冻结 AIIR V0.1 MVP 范围；
* [ ] 输出第一份 PRD；
* [ ] 输出第一份开发 Task；
* [ ] 交付 Claude Code 开始开发。

---

## 九、当前重要决策

### 决策一：AIIR 是研究系统，不是交易系统

AIIR 不进行：

* 自动买入；
* 自动卖出；
* 自动下单；
* 无人监督的交易执行；
* 收益承诺。

### 决策二：用户拥有最终决策权

AIIR 提供：

* 信息；
* 证据；
* 知识；
* 分析；
* 推理；
* 讨论；
* 决策支持。

最终决策始终由用户完成。

### 决策三：引入统一 LLM Gateway

所有大模型调用必须经过统一 LLM Gateway。

上层业务模块不得直接调用：

* OpenAI SDK；
* Anthropic SDK；
* Gemini SDK；
* 其他模型厂商 SDK。

### 决策四：Provider Adapter

每个模型厂商通过统一 Provider 接口接入。

首个 MVP 只实现一个 Provider，但架构必须允许后续增加：

* OpenAI Provider；
* Anthropic Provider；
* Gemini Provider；
* Local Model Provider；
* 其他兼容 Provider。

### 决策五：确定性程序优先

以下任务必须由普通程序完成：

* 财务指标计算；
* 公式计算；
* 数据格式校验；
* 时间排序；
* 去重；
* 来源记录；
* 结构化解析；
* 权限控制；
* 任务调度。

不得让大模型猜测可以准确计算或验证的结果。

### 决策六：Evidence First

重要结论必须关联：

* 来源；
* 原始事实；
* 发布时间；
* 获取时间；
* 证据强度；
* 事实、推断或观点类型。

### 决策七：Prompt 外置与版本化

Prompt 不得散落或硬编码在业务代码中。

运行时 Prompt 应集中存放、版本管理并接受测试。

### 决策八：LLM 输出需要治理

模型输出必须经过：

* Schema 校验；
* 来源检查；
* 证据覆盖检查；
* 幻觉风险检查；
* 不确定性标记；
* 必要时的第二次复核。

---

## 十、MVP 当前约束

AIIR V0.1 计划只实现一个明确、可验收的最小闭环：

```text
输入一家美国上市公司的股票标识
        ↓
固定研究截止时间
        ↓
采集公司官方资料、监管披露和有限结构化财务数据
        ↓
清洗、去重、时间归一化和确定性计算
        ↓
构建 Source 与 Evidence
        ↓
通过一个 LLM Provider 生成候选 Claims
        ↓
执行 Schema、Citation、Evidence 与数值校验
        ↓
输出 Markdown 公司基本面研究快照
```

V0.1 报告不包含目标价、买入/卖出/持有评级、股价预测和个性化资产配置建议。

V0.1 暂不实现：

* 多模型投票；
* 自动模型路由；
* 大规模多 Agent 协作；
* 自动交易；
* 知识图谱；
* 模型微调；
* 复杂 Web Dashboard；
* 大规模实时行情系统；
* 目标价和买入、卖出或持有评级；
* 个性化资产配置和“适合你”的投资结论；
* 本地模型集群。

---

## 十一、当前文档状态

| 文档                         | 状态             |
| -------------------------- | -------------- |
| `README.md`                | 已完成，后续按架构更新    |
| `PROJECT_CONTEXT.md`       | 已更新为稳定背景文档      |
| `PROJECT_STATUS.md`        | 当前文档           |
| `CHANGELOG.md`             | 已更新            |
| `CLAUDE.md`                | 已更新 LLM 开发规则   |
| `00-VISION.md`             | 已完成            |
| `CONSTITUTION.md`          | v1.1，已补充时点、质量与合规原则 |
| `ROADMAP.md`               | 未开始            |
| `SYSTEM_ARCHITECTURE.md`   | Proposed 初稿已完成，待批准 |
| `LLM_ARCHITECTURE.md`      | 未开始            |
| `TECH_STACK.md`            | 未开始            |
| `AGENT_ARCHITECTURE.md`    | 未开始            |
| `EVIDENCE_ARCHITECTURE.md` | 下一优先级          |
| `COMPLIANCE_BOUNDARIES.md` | Draft 已完成       |

---

## 十二、当前建议源码结构

```text
src/
└── aiir/
    ├── interface/
    ├── application/
    ├── domain/
    │   ├── research/
    │   ├── sources/
    │   ├── evidence/
    │   ├── claims/
    │   └── reports/
    ├── workflows/
    ├── llm/
    │   ├── gateway/
    │   ├── providers/
    │   ├── schemas/
    │   └── evaluation/
    ├── data_sources/
    ├── processing/
    ├── validation/
    ├── reporting/
    ├── storage/
    ├── observability/
    └── core/
```

V0.1 采用模块化单体，不建立独立 `agents/`、模型 `routing/`、知识图谱或 Memory 平台。后续新增必须由实际用例和 ADR 支持。

---

## 十三、开发环境

| 项目              | 当前配置                              |
| --------------- | --------------------------------- |
| 操作系统            | Ubuntu 24.04                      |
| 开发执行            | Claude Code                       |
| 产品与架构设计         | ChatGPT                           |
| 辅助模型            | Google Gemini                     |
| 版本管理            | Git + GitHub                      |
| 后端语言            | 待 `TECH_STACK.md` 确认              |
| MVP 模型 Provider | 待 `MODEL_PROVIDER_STRATEGY.md` 确认 |

---

## 十四、当前风险

### 风险一：过早实施多模型系统

**风险：**

同时接入多个模型会显著增加接口、测试、成本、路由和异常处理复杂度。

**应对：**

MVP 只实现一个 Provider，保留统一接口。

### 风险二：把大模型当作计算器或数据库

**风险：**

可能导致数字错误、引用错误和事实幻觉。

**应对：**

确定性任务由代码完成，模型只负责理解与推理。

### 风险三：模型厂商锁定

**风险：**

业务代码直接依赖单一 SDK，未来切换成本过高。

**应对：**

所有模型调用统一经过 LLM Gateway 和 Provider Adapter。

### 风险四：输出看似专业但缺少证据

**风险：**

系统退化为普通财经聊天机器人。

**应对：**

Evidence、Citation、Schema Validation 和 Evaluation 作为核心架构能力。

### 风险五：需求持续扩张

**风险：**

项目长期停留在设计阶段，无法形成可用闭环。

**应对：**

总体架构确定后立即冻结 V0.1 MVP，只实现最小闭环。

### 风险六：上下文与项目事实丢失

**风险：**

不同 AI 或新对话无法准确恢复状态。

**应对：**

所有正式信息进入 Git；动态状态及时更新到本文件。

---

## 十五、下一步计划

按顺序执行：

1. Product Owner 审阅并批准 V0.1 唯一研究场景；
2. 建立 `SYSTEM_ARCHITECTURE.md` 中列出的关键 ADR；
3. 完成 `EVIDENCE_ARCHITECTURE.md`；
4. 完成 `RESEARCH_WORKFLOW_ARCHITECTURE.md`；
5. 完成最小 `LLM_ARCHITECTURE.md`；
6. 冻结 V0.1 输入、输出、非目标和验收标准；
7. 完成 `TECH_STACK.md` 与 `TEST_STRATEGY.md`；
8. 确定首个 MVP 的模型 Provider；
9. 输出首个 PRD；
10. 输出首个 Task；
11. Claude Code 开始编码与测试。

---

## 十六、标准工作流

任何功能开发必须遵循：

```text
Idea
  ↓
Architecture Discussion
  ↓
PRD
  ↓
Task
  ↓
Claude Code Implementation
  ↓
Claude Code Self Review
  ↓
ChatGPT Architecture and Quality Review
  ↓
Product Owner Final Acceptance
  ↓
Merge
```

重大技术决策需要建立 ADR。

---

## 十七、项目原则

AIIR 当前坚持：

* Design First；
* Documentation First；
* Evidence First；
* Human Decision；
* Deterministic Before Generative；
* Model Independence；
* Structured Output；
* Git is the Source of Truth；
* Keep It Simple；
* No Premature Overengineering。

---

## 十八、维护规则

`PROJECT_STATUS.md` 是动态文档。

以下情况发生时必须更新：

1. 当前 Sprint 发生变化；
2. 当前 Milestone 发生变化；
3. 完成核心文档；
4. 形成重大产品或架构决策；
5. 开始新的主要开发任务；
6. MVP 范围发生变化；
7. 项目出现新的风险或阻塞。

任何 AI 开始工作前，应首先阅读：

1. `PROJECT_CONTEXT.md`；
2. `PROJECT_STATUS.md`；
3. 与当前任务相关的正式文档。

