# AIIR Documentation Map

本目录是 AIIR 的正式文档体系。

AIIR 当前处于 **ChatGPT-first 验证阶段**。文档的目的不是证明项目复杂，而是确保每一步工作都能回答三个问题：

1. 用户当前真正需要解决什么问题？
2. 成熟大模型与简单文件能否已经解决？
3. 哪个被反复验证的缺口值得软件化？

---

## 推荐阅读顺序

1. [`00-VISION/00-VISION.md`](00-VISION/00-VISION.md)
2. [`01-GOVERNANCE/CONSTITUTION.md`](01-GOVERNANCE/CONSTITUTION.md)
3. [`01-GOVERNANCE/INVESTMENT_SAFETY.md`](01-GOVERNANCE/INVESTMENT_SAFETY.md)
4. [`04-PRODUCT/CHATGPT_FIRST_PILOT.md`](04-PRODUCT/CHATGPT_FIRST_PILOT.md)
5. [`04-PRODUCT/USER_WORKFLOWS.md`](04-PRODUCT/USER_WORKFLOWS.md)
6. [`02-ROADMAP/ROADMAP.md`](02-ROADMAP/ROADMAP.md)
7. [`03-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`](03-ARCHITECTURE/SYSTEM_ARCHITECTURE.md)

动态项目状态请始终查看根目录的 [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)。

---

## 文档分区

### 00 — Vision

定义 AIIR 为什么存在、服务谁、不做什么，以及怎样判断项目值得继续。

### 01 — Governance

定义不可违反的产品、安全、隐私和投资决策原则。

- `CONSTITUTION.md`：项目宪法
- `INVESTMENT_SAFETY.md`：投资安全边界
- `PERSONAL_DATA_POLICY.md`：个人数据治理

### 02 — Roadmap

定义从人工验证到有限软件化的阶段门槛。Roadmap 不是功能愿望清单。

### 03 — Architecture

定义当前最小架构和未来扩展边界。架构必须服从已验证需求。

### 04 — Product

定义 ChatGPT-first 试点、首个潜在软件版本和真实用户工作流。

### 05 — Technology

记录当前技术选择与本地开发环境。未通过软件化门槛前，不建设重型技术栈。

### 07 — Data

定义可靠来源、研究资料、个人投资数据和长期知识的管理方法。

### 08 — Prompts

定义 Prompt 的职责、版本和评估方式。Prompt 不是业务事实数据库。

### 09 — Workflows

定义引导研究、决策准备和事后复盘的标准流程。

### 10 — Quality

定义评估、审查和测试标准，包括与直接使用 ChatGPT 的对照评估。

### ADR / PRD / TASK / REVIEW

提供正式决策、产品需求、执行任务和复盘记录模板。

---

## 当前明确删除或延后的主题

以下内容在真实需求被验证前不建立独立架构：

- 多 Agent 系统；
- Agent 自主协作；
- 通用长期记忆平台；
- 知识图谱；
- 多模型投票与复杂路由；
- 自动交易；
- 公共 SaaS 与多租户；
- 机构级实时行情平台。

若未来需要引入，必须先提交 ADR，并证明它解决了已重复出现的真实问题。

---

## 文档维护规则

- 稳定背景写入 `PROJECT_CONTEXT.md`；
- 动态状态只写入 `PROJECT_STATUS.md`；
- 原则性决策写入 Constitution 或 ADR；
- 不在多个文件复制同一动态事实；
- 文档中写“已完成”前，相关文件和可验证产物必须真实存在；
- 每次重大方向变化必须更新 `CHANGELOG.md`。
