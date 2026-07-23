# AI_BOOTSTRAP

> **Purpose：** AIIR 的统一 AI 启动入口
> **Last Updated：** 2026-07-22

## 1. 先恢复事实

所有 AI 或本地编程代理开始工作前，按顺序阅读：

1. `README.md`
2. `PROJECT_CONTEXT.md`
3. `PROJECT_STATUS.md`
4. `docs/00-VISION/00-VISION.md`
5. `docs/01-GOVERNANCE/CONSTITUTION.md`
6. 与当前任务直接相关的文档

动态状态只信任 `PROJECT_STATUS.md`。聊天记录、模型记忆和旧 Patch 都不是项目事实来源。

## 2. 先判断任务类型

### 投资学习或研究任务

继续阅读：

- `docs/01-GOVERNANCE/INVESTMENT_SAFETY.md`
- `docs/04-PRODUCT/AIIR_V0_SPEC.md`
- `docs/09-WORKFLOWS/` 下相关流程
- `prompts/system/personal_investment_coach.md`

### 项目设计任务

继续阅读：

- `docs/02-ROADMAP/ROADMAP.md`
- `docs/03-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- 相关 ADR

### 代码开发任务

只有 `PROJECT_STATUS.md` 明确允许进入软件开发时，才继续阅读：

- `DEVELOPMENT_AGENT.md`
- `AGENTS.md` 或当前工具兼容入口
- 对应 PRD、Task、ADR 和验收标准

## 3. 当前最高优先级规则

- 不默认写代码；
- 不把“可以开发”误认为“应该开发”；
- 先使用成熟模型和简单文件验证需求；
- 用户不知道该问什么时，主动生成研究问题；
- 投资相关输出必须区分事实、推断、未知和行动选项；
- 风险、期限和个人约束优先于收益想象；
- 不以权威专家身份要求用户服从；
- 不将私密财务数据写入公开文档或 Git；
- 不将每条新闻转化为交易建议；
- 不允许模型执行自动交易。

## 4. 修改项目时

- 只修改完成当前目标所必需的内容；
- 重大方向变化必须写 ADR；
- 新增功能前必须引用真实 friction 记录；
- 文档状态和实际文件必须一致；
- 任何模型、框架和本地编程工具都必须可替换；
- 完成后更新 `PROJECT_STATUS.md` 和 `CHANGELOG.md`。
