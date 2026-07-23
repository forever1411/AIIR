# AIIR 系统架构

> **Architecture Style：** ChatGPT-first，Local-first，Thin Control Layer
> **Current Implementation：** 无业务软件
> **Status：** Candidate architecture, validated incrementally

## 1. 架构目标

AIIR 的架构不是为了替代成熟大模型，而是为了在需要时补足成熟聊天工具的以下弱点：

- 个人事实不是严格数据库；
- 长期决定散落在聊天中；
- 数值计算和状态可能不可靠；
- 研究流程可能每次不同；
- 新旧判断难以系统比较；
- 私密数据需要更明确的本地控制。

架构必须允许项目停留在“只使用 ChatGPT 和文件”的状态。如果没有证据证明软件有额外价值，不建设后续层。

## 2. 分层演进

```text
Layer 0  Mature Model + Manual Files
         ChatGPT Project / Deep Research / uploaded references

Layer 1  Local Context Store
         private Markdown / CSV / SQLite

Layer 2  Deterministic Utilities
         validation / calculations / source metadata / exports

Layer 3  Model Gateway
         minimal context assembly / structured output / provider adapter

Layer 4  Optional Workflows
         source discovery / decision review / change comparison
```

每一层只有在上一层经过真实使用后仍存在明确摩擦时才出现。

## 3. 当前 V0 架构

```text
User
  │
  ├─ vague question
  │
  ▼
ChatGPT Project
  ├─ coach system instruction
  ├─ private investment profile
  ├─ portfolio snapshot
  ├─ investment rules
  ├─ decision journal
  └─ selected public sources
  │
  ▼
Guided workflow
  ├─ clarify objective
  ├─ generate missing questions
  ├─ research reliable sources
  ├─ separate facts / inference / unknowns
  ├─ challenge confirmation bias
  ├─ identify next action
  └─ record friction and decision
```

当前架构中没有后端、数据库、Agent、调度器或自动监控。

## 4. 未来最小软件边界

当软件进入条件满足后，首个应用应采用模块化单体：

```text
aiir/
├── context/       # personal profile and portfolio snapshots
├── journal/       # decisions and reviews
├── research/      # questions, sources, notes
├── checks/        # deterministic risk and data checks
├── llm/           # optional provider-neutral gateway
├── export/        # context packs and reports
└── cli.py         # first interface candidate
```

首版默认：

- Python；
- CLI；
- 本地文件或 SQLite；
- 无服务器；
- 无 Redis；
- 无消息队列；
- 无微服务；
- 无多 Agent；
- 一个模型 Provider；
- 用户显式触发每次运行。

## 5. 核心领域对象

### 5.1 InvestmentProfile

描述相对稳定的个人约束：

- goals；
- time_horizons；
- liquidity_needs；
- risk_constraints；
- knowledge_level；
- prohibited_assets；
- last_reviewed_at。

### 5.2 PortfolioSnapshot

某一时点的事实，而不是自动记忆：

- as_of；
- currency；
- cash；
- positions；
- liabilities summary；
- source；
- verified_at。

### 5.3 ResearchQuestion

- original_question；
- inferred_objective；
- generated_subquestions；
- missing_context；
- scope；
- status。

### 5.4 Source

- source_type；
- publisher；
- title；
- canonical_url；
- published_at；
- retrieved_at；
- period_covered；
- reliability_notes。

### 5.5 Evidence

- source_id；
- locator；
- excerpt_or_fact；
- effective_at；
- classification；
- verification_status。

### 5.6 Thesis

- subject；
- statement；
- supporting_evidence；
- opposing_evidence；
- assumptions；
- invalidation_conditions；
- confidence；
- valid_from；
- superseded_by。

### 5.7 DecisionRecord

- decided_at；
- decision；
- context_snapshot_id；
- reasons；
- alternatives；
- risks；
- unknowns；
- invalidation_conditions；
- review_at。

### 5.8 Review

- decision_id；
- reviewed_at；
- outcome；
- process_quality；
- result_vs_luck；
- missed_information；
- bias_observed；
- rule_update_candidate。

### 5.9 Friction

- observed_at；
- workflow；
- description；
- frequency；
- impact；
- workaround；
- automation_candidate；
- evidence_links。

## 6. 数据真相层级

不同事实来源拥有不同权威级别：

1. **用户确认的本地结构化数据**：持仓、目标和规则；
2. **官方原始来源**：财报、公告、监管和统计数据；
3. **确定性计算结果**：从已验证输入计算；
4. **模型提取结果**：必须保留来源和验证状态；
5. **模型分析**：属于推断，不得覆盖原始事实。

模型记忆不能覆盖层级 1 至 3。

## 7. 模型边界

模型适合：

- 理解模糊问题；
- 生成研究问题；
- 解释术语；
- 综合文本；
- 提出反方观点；
- 形成情景和行动选项；
- 将自然语言日志转为候选结构。

模型不适合单独负责：

- 持仓事实；
- 精确财务计算；
- 最新状态判断；
- 来源真实性；
- 自动下单；
- 无条件买卖决定。

## 8. 最小 LLM Gateway

只有软件需要模型 API 时才建设。最小接口：

```text
generate_structured(
    task_type,
    instructions,
    context_pack,
    response_schema,
    model_config,
    trace_context,
)
```

Gateway 负责：

- Provider 适配；
- 超时和错误；
- Prompt 版本；
- Schema 校验；
- 最小化敏感上下文；
- 调用元数据；
- 成本和使用统计。

不负责：

- 自动模型竞价；
- 多模型投票；
- 自主 Agent 循环；
- 无限重试；
- 隐式交易行动。

## 9. 安全架构

- 私有数据目录默认被 Git 忽略；
- API Key 只从环境变量读取；
- 模型请求按任务最小化；
- 日志不保存完整敏感 Prompt；
- 所有外部获取内容视为不可信输入；
- 报告中的外部文本不能成为系统指令；
- 用户必须显式确认任何影响真实资金的行为；
- 首版不连接券商。

## 10. 失败与降级

- 模型不可用：保留本地事实和原始来源，不产生伪结果；
- 来源不可用：标记缺失，不使用未经核实的替代事实；
- 结构化输出失败：不写入正式记录；
- 数值冲突：停止相关结论，要求核对；
- 数据过期：显示 as-of 时间；
- 私有数据缺失：输出一般原则，不伪装个性化建议；
- 用户情绪强烈：建议冷静期，而不是加速行动。

## 11. 架构质量门槛

未来软件必须满足：

- 同一事实只有一个正式来源；
- 所有组合计算可复现；
- 每个模型输出可追踪 Prompt 和模型版本；
- 重要结论可定位来源；
- 个人数据可导出和删除；
- 模型失败不破坏本地记录；
- 无模型时仍能查看持仓、规则和日志；
- 不需要后台服务即可完成核心任务；
- 任何自动化都可关闭；
- 不通过增加模型调用制造“智能感”。

## 12. 明确不采用

当前不采用：

- 微服务；
- Kubernetes；
- Redis；
- Kafka；
- 向量数据库；
- 知识图谱数据库；
- 多 Agent 编排框架；
- 自动浏览器长期运行；
- 实时交易数据系统；
- 券商 API；
- 面向多用户的认证授权。

## 13. 架构决策顺序

1. 完成 ChatGPT-first 试点；
2. 确认真实 friction；
3. 创建 PRD 和 ADR；
4. 选择最小数据结构；
5. 先做无模型可用的确定性核心；
6. 再接入一个模型；
7. 用真实场景与普通 ChatGPT 对照；
8. 未证明增益则停止扩展。
