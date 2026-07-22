# AIIR 系统架构（SYSTEM_ARCHITECTURE）

> **版本：** v0.1
> **状态：** Proposed
> **Owner：** Chief Architect
> **最后更新：** 2026-07-22
> **适用范围：** AIIR V0.1 MVP 及后续架构演进基线

---

## 一、文档目的

本文件定义 AIIR 的总体系统边界、核心领域对象、模块职责、数据流、模型调用边界、质量属性和 MVP 架构约束。

本文件不确定具体数据库、框架、云服务和模型供应商；这些内容由后续 `TECH_STACK.md` 和专项架构文档决定。

本文件是后续 PRD、Task、代码模块和测试策略的架构依据。

---

## 二、架构目标

AIIR V0.1 必须建立一个最小但完整的证据化研究闭环：

```text
Research Request
       ↓
Source Acquisition
       ↓
Normalization and Deterministic Computation
       ↓
Evidence Construction
       ↓
Claim-oriented LLM Analysis
       ↓
Validation and Citation Binding
       ↓
Markdown Research Report
       ↓
Run Record and Audit Trail
```

该闭环必须满足：

1. 核心结论可以追溯到证据；
2. 数值和规则由确定性程序处理；
3. 模型输出被 Schema 约束；
4. 研究任务保留时点信息和版本信息；
5. 模型失败不导致已采集数据丢失；
6. 用户始终拥有最终决策权；
7. 架构保持简单，不提前实现未来平台能力。

---

## 三、V0.1 MVP 范围

### 3.1 唯一研究场景

V0.1 只支持一个明确场景：

> 用户输入一家美国上市公司的股票标识，系统基于可获得的公司官方资料、监管披露和有限结构化财务数据，生成一份“公司基本面研究快照”。

研究截止时间必须由任务记录明确保存。

### 3.2 V0.1 报告内容

报告至少包括：

- 公司与证券基本信息；
- 使用的数据来源和研究截止时间；
- 最近年度与季度的核心财务趋势；
- 业务与分部概览；
- 现金流、资产负债和盈利能力要点；
- 公司已披露的主要风险；
- 近期重大变化；
- 核心 Claims 及其 Evidence；
- 假设、反方观点、不确定性与失效条件；
- 数据缺失和验证失败；
- 引用清单；
- 非个性化投资建议免责声明。

### 3.3 V0.1 非目标

V0.1 不实现：

- 目标价、买入、卖出或持有评级；
- 股价预测；
- 个性化资产配置；
- 自动交易和自动下单；
- 宏观全景研究；
- 完整行业横向比较；
- 社交媒体情绪分析；
- 多模型路由、投票或自动 fallback；
- 大规模多 Agent 协作；
- 知识图谱；
- 模型微调；
- 实时行情系统；
- 复杂 Web Dashboard；
- 微服务架构。

任何扩大范围的提议必须先形成 ADR，并更新本节。

---

## 四、架构风格

### 4.1 模块化单体

V0.1 采用：

> **逻辑上模块化，部署上单体化。**

默认形态：

- 单一代码仓库；
- 单一后端应用；
- 单一主数据库或等价持久化系统；
- 单一研究任务执行入口；
- 可按需增加最小后台任务机制；
- 模块之间通过明确的应用接口和领域对象协作。

V0.1 不引入微服务、分布式事件总线、服务网格或独立 Agent 服务。

### 4.2 分层原则

```text
Interface Layer
Application Layer
Domain Layer
Infrastructure Layer
```

- Interface Layer：接收请求并呈现结果；
- Application Layer：编排研究用例与任务状态；
- Domain Layer：保存领域规则、对象和接口；
- Infrastructure Layer：实现数据源、存储、LLM Provider 和外部集成。

依赖方向应尽量指向领域层，业务规则不得依赖具体模型 SDK 或具体数据库实现。

---

## 五、核心领域模型

AIIR 的核心不是“聊天消息”，而是可审计的研究对象。

### 5.1 ResearchRequest

表示用户提出的研究任务。

最小字段：

```text
request_id
security_identifier
research_type
requested_at
research_cutoff_at
requested_by
scope_version
```

### 5.2 ResearchRun

表示一次可追踪的研究执行。

```text
run_id
request_id
status
started_at
completed_at
failed_at
failure_reason
pipeline_version
prompt_versions
schema_versions
model_configuration
cost_usage
```

### 5.3 Source

表示原始来源。

```text
source_id
source_type
canonical_url
publisher
author
published_at
retrieved_at
effective_at
reporting_period
license_or_usage_policy
raw_content_hash
```

### 5.4 Evidence

表示来源中可定位、可验证的证据单元。

```text
evidence_id
source_id
excerpt_or_value
locator
evidence_type
entity_ids
published_at
retrieved_at
effective_at
reporting_period
reliability_grade
freshness_status
```

`locator` 可以是页码、章节、表格、段落、字段路径或其他可重定位标识。

### 5.5 Claim

表示可被证据支持、反驳或标记不确定的陈述。

```text
claim_id
run_id
claim_text
claim_type
supporting_evidence_ids
contradicting_evidence_ids
analytical_basis
assumptions
counterarguments
uncertainty
confidence
invalidation_conditions
validation_status
```

`claim_type` 至少支持：

- Fact；
- Inference；
- Opinion；
- Unknown；
- Conflict。

### 5.6 ResearchReport

表示面向用户的最终产物。

```text
report_id
run_id
report_version
research_cutoff_at
sections
claim_ids
citation_index
disclosures
created_at
```

Report 是 Claim 和 Evidence 的呈现，不是事实的唯一存储位置。

---

## 六、核心模块与职责

### 6.1 Interface

职责：

- 接收股票标识和研究请求；
- 返回任务状态；
- 展示或导出 Markdown 报告；
- 不包含研究业务规则。

### 6.2 Research Application Service

职责：

- 创建 ResearchRequest 和 ResearchRun；
- 编排完整研究流程；
- 管理任务状态和失败恢复；
- 传递 trace context；
- 控制预算、超时和重试；
- 组装最终报告。

### 6.3 Security and Entity Resolution

职责：

- 验证股票标识；
- 解析证券、公司和监管标识之间的映射；
- 防止把不同证券或公司数据混合；
- 输出规范化实体标识。

### 6.4 Source Acquisition

职责：

- 从批准的数据源获取资料；
- 记录来源、获取时间和授权边界；
- 保存原始内容或合规允许的引用；
- 处理超时、限流和来源不可用；
- 不负责生成投资结论。

### 6.5 Normalization and Processing

职责：

- 解析和标准化数据；
- 去重；
- 时间与单位归一化；
- 财务数据映射；
- 由确定性代码完成公式计算；
- 生成可验证的结构化事实。

### 6.6 Evidence Service

职责：

- 从 Source 和结构化事实建立 Evidence；
- 保存证据定位；
- 管理 Evidence 与实体、时间和报告期的关系；
- 计算 freshness 和基础可靠性标记；
- 提供 Claim 绑定接口。

### 6.7 Research Workflow

职责：

- 定义研究步骤和每一步输入输出；
- 选择允许进入模型上下文的 Evidence；
- 执行结构化 LLM Task；
- 生成候选 Claim；
- 控制步骤顺序、失败和重试。

V0.1 的 Workflow 是受控状态机，不是自主 Agent。

### 6.8 LLM Gateway

职责：

- 提供业务无关的统一模型调用入口；
- 加载版本化 Prompt；
- 注入 Schema；
- 调用唯一 Provider Adapter；
- 统一超时、错误、token 和成本记录；
- 返回结构化结果。

V0.1 推荐的最小接口：

```text
generate_structured(
    messages,
    response_schema,
    model_config,
    timeout,
    trace_context
)
```

V0.1 不实现动态模型路由、模型投票和复杂 fallback 链。

### 6.9 Validation Service

职责：

- Schema 校验；
- Claim 类型校验；
- Evidence ID 存在性校验；
- 引用是否支持 Claim 的规则检查；
- 数值与确定性计算结果对比；
- 证据覆盖检查；
- 不确定性和失效条件完整性检查；
- 将失败项转为显式 ValidationFinding。

验证服务不能保证模型绝对正确，但必须阻止明显无来源、无引用或结构错误的输出直接成为最终报告。

### 6.10 Report Builder

职责：

- 使用已验证的结构化对象生成 Markdown；
- 统一章节、引用和免责声明；
- 不在模板层新增未经验证的事实或推断；
- 保留报告版本和生成时间。

### 6.11 Storage

职责：

- 保存 ResearchRequest、ResearchRun、Source、Evidence、Claim、ValidationFinding 和 Report；
- 支持版本追踪和审计；
- 支持删除和数据保留策略；
- 不把模型上下文当作唯一持久化记录。

### 6.12 Observability

职责：

- 记录任务状态和阶段耗时；
- 记录外部来源和模型调用错误；
- 记录 Prompt、Schema、模型配置和处理器版本；
- 记录 token、成本和重试；
- 对敏感信息进行脱敏；
- 支持按 run_id 重建执行轨迹。

---

## 七、职责边界

### 7.1 必须由确定性程序完成

- 证券标识校验；
- 时间排序和时间窗口判断；
- 单位换算；
- 财务指标与公式计算；
- 去重；
- Schema 校验；
- ID 关联；
- 引用完整性检查；
- 权限控制；
- 任务状态管理；
- 报告模板装配；
- 成本和调用统计。

### 7.2 可以由模型完成

- 文本摘要；
- 业务变化识别；
- 风险主题归纳；
- 在给定 Evidence 范围内形成候选 Claim；
- 识别来源之间的潜在冲突；
- 形成结构化分析依据、反方观点和失效条件；
- 将已验证内容转化为自然语言表达。

### 7.3 模型禁止承担

- 生成不存在的来源；
- 猜测缺失财务数字；
- 替代确定性计算；
- 决定访问权限；
- 修改任务审计记录；
- 绕过 Schema；
- 在没有证据的情况下给出确定性投资结论。

---

## 八、端到端数据流

### 阶段 1：创建研究任务

1. 接收股票标识；
2. 解析规范化实体；
3. 创建 ResearchRequest；
4. 固定 research_cutoff_at；
5. 创建 ResearchRun。

### 阶段 2：采集来源

1. 按批准的数据源清单采集；
2. 保存 Source metadata；
3. 记录原始内容哈希；
4. 标记授权边界和获取结果；
5. 失败来源进入运行记录。

### 阶段 3：结构化处理

1. 解析内容；
2. 识别报告期和时间；
3. 归一化财务字段；
4. 计算派生指标；
5. 生成结构化事实；
6. 执行确定性校验。

### 阶段 4：构建 Evidence

1. 从来源或结构化事实创建 Evidence；
2. 保存 locator；
3. 关联公司和证券实体；
4. 标记时效和可靠性；
5. 排除超过研究截止时间或无法定位的内容。

### 阶段 5：模型分析

1. Workflow 选择有限 Evidence；
2. 加载版本化 Prompt 和 Schema；
3. 经 LLM Gateway 调用单一 Provider；
4. 返回结构化候选 Claims；
5. 保存模型配置和调用指标。

### 阶段 6：验证

1. 校验 Schema；
2. 校验 Claim 与 Evidence 关联；
3. 对数字进行确定性复核；
4. 检查核心 Claim 的证据覆盖；
5. 标记冲突、未知和低置信度；
6. 必要时只对失败步骤进行有限重试。

### 阶段 7：报告生成

1. 选择通过验证或被明确标记的 Claims；
2. 生成 Markdown；
3. 附加引用、截止时间、限制和免责声明；
4. 保存 Report 与 run_id；
5. 将任务标记为 completed、partial 或 failed。

---

## 九、失败与降级策略

研究任务状态至少包括：

```text
pending
running
partial
completed
failed
cancelled
```

### 9.1 数据源失败

- 其他阶段不得伪造缺失数据；
- 运行可以进入 `partial`；
- 报告必须显示缺失来源及影响。

### 9.2 LLM 失败

- 已采集 Source、Evidence 和结构化数据必须保留；
- 允许有限次数重试；
- 超出预算或重试限制后进入 `partial` 或 `failed`；
- 不自动切换到未配置的其他 Provider。

### 9.3 验证失败

- 不合格 Claim 不得静默进入最终报告；
- 可降级为 `Unknown`、`Conflict` 或被排除；
- ValidationFinding 必须保存。

### 9.4 报告生成失败

- 结构化研究对象必须保留；
- 报告可重建，不重新采集全部来源。

---

## 十、质量属性与 MVP 验收门槛

| 质量属性 | MVP 最低验收标准 |
| --- | --- |
| 可追溯性 | 每个核心 Claim 至少关联一个真实存在的 Evidence，或明确标记为 Unknown/Conflict |
| 引用准确性 | 引用必须实质支持对应 Claim，不能只与主题相关 |
| 数值准确性 | 报告中的财务计算结果来自确定性代码，并能回溯输入值和公式 |
| 时点正确性 | 每份报告显示 research_cutoff_at，来源和财务数据保留关键时间字段 |
| 可复现性 | 固定输入、数据快照和版本配置时，可重建结构化研究结果 |
| 可观测性 | 每次运行记录 pipeline、Prompt、Schema、模型配置、阶段耗时、错误和成本 |
| 降级能力 | 数据源或 LLM 部分失败时，不丢失已完成阶段结果，并输出 partial 状态 |
| 安全性 | 密钥不进入日志、Prompt、报告或数据库普通字段；外发模型数据最小化 |
| 成本约束 | 每个 ResearchRun 有调用次数、token、超时和预算上限 |
| 可测试性 | 核心流程可使用固定 fixture 离线测试，不依赖实时外部服务才能验证业务规则 |

上述指标的具体数值阈值由 `TEST_STRATEGY.md` 和首个 PRD 定义。

---

## 十一、安全与数据边界

- Secrets 只能通过专用配置或密钥机制注入；
- 日志默认不记录完整 Prompt、敏感用户数据或未经授权的原文；
- Source 必须保存数据使用边界；
- Provider 请求应发送完成任务所需的最小内容；
- 用户数据、研究数据和系统审计数据应逻辑隔离；
- 删除和保留策略必须可执行；
- V0.1 应遵循 `COMPLIANCE_BOUNDARIES.md`。

---

## 十二、建议代码模块

```text
src/
└── aiir/
    ├── interface/
    ├── application/
    │   ├── research_service/
    │   └── run_management/
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

说明：

- V0.1 不需要独立 `agents/` 模块；
- V0.1 不需要 `routing/`；
- V0.1 不需要独立 `knowledge/` 或 `memory/` 平台；
- 后续只有在明确用例和 ADR 支持下才新增。

---

## 十三、Agent、Workflow、Tool、Memory 与 Knowledge 的定义

- `Workflow`：确定性的研究步骤和状态转换；
- `Tool`：可执行、可测试的确定性能力；
- `LLM Task`：受 Prompt、Evidence、Schema 和预算约束的一次模型调用；
- `Agent`：在未来版本中，由 Workflow、Tool 和 LLM Task 组合形成的受控研究角色；
- `Memory`：经授权、结构化、可管理生命周期的持久上下文；
- `Knowledge`：带来源、版本和治理规则的长期可查询内容。

V0.1 只实现 Research Workflow，不实现自主 Agent。

---

## 十四、后续专项文档

在本架构批准后，按以下顺序补充：

1. `EVIDENCE_ARCHITECTURE.md`；
2. `RESEARCH_WORKFLOW_ARCHITECTURE.md`；
3. `LLM_ARCHITECTURE.md`；
4. `TECH_STACK.md`；
5. `TEST_STRATEGY.md`；
6. 首个 PRD 与 Task。

`AGENT_ARCHITECTURE.md`、`MEMORY_ARCHITECTURE.md` 和完整 `DATA_ARCHITECTURE.md` 不作为 V0.1 开发前置条件，除非新的 ADR 证明其必要性。

---

## 十五、需要 ADR 的决策

至少应为以下决策建立 ADR：

- ADR-0001：V0.1 采用模块化单体；
- ADR-0002：V0.1 唯一研究场景与非目标；
- ADR-0003：Claim 和 Evidence 作为核心领域对象；
- ADR-0004：统一 LLM Gateway，首版单 Provider；
- ADR-0005：V0.1 使用受控 Workflow，不使用自主 Agent；
- ADR-0006：point-in-time correctness 的数据时间模型。

在 ADR 建立前，本文件可作为 Proposed 基线；ADR 批准后将状态更新为 Approved。

---

## 十六、架构完成定义

`SYSTEM_ARCHITECTURE.md` 只有在以下条件全部满足时才能标记为 Approved：

- Product Owner 确认 V0.1 唯一研究场景；
- MVP 输入、输出和非目标明确；
- 核心领域对象获得确认；
- 模块职责和依赖边界获得确认；
- 质量属性和最低验收标准获得确认；
- 关键 ADR 已建立；
- 后续专项文档顺序已确认。
