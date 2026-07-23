# ChatGPT-first Pilot

## 1. Purpose

本试点验证：在不开发独立软件的情况下，AIIR 的引导、个人上下文、风险检查和复盘流程，是否相对直接使用成熟大模型产生实际增益。

试点不是演示项目，也不是为了证明必须写代码。

## 2. Pilot package

```text
成熟大模型工作区
├── AIIR 教练 Prompt
├── 私有投资资料
├── 标准工作流
├── 原始来源与研究输出
└── 摩擦与评估记录
```

推荐使用 ChatGPT Project，但同样可以使用能够保存项目指令、文件和长期上下文的其他成熟工具。

## 3. Setup

### 3.1 Create the workspace

创建一个独立项目，例如 `AIIR Personal Investment`，避免与无关聊天混合。

### 3.2 Install the instruction

将 `prompts/personal_investment_coach.md` 作为项目指令。平台长度受限时，保留安全边界、主动引导、事实分层、反方检查和下一步要求。

### 3.3 Create private files

在本地仓库外或被 `.gitignore` 排除的目录中执行：

```bash
mkdir -p workspace/private
cp templates/investment_profile.example.md workspace/private/investment_profile.md
cp templates/portfolio.example.csv workspace/private/portfolio.csv
cp templates/watchlist.example.csv workspace/private/watchlist.csv
cp templates/investment_rules.example.md workspace/private/investment_rules.md
cp templates/decision_journal.example.md workspace/private/decision_journal.md
cp templates/friction_log.example.md workspace/private/friction_log.md
```

只填写当前任务真正需要的信息。首次使用不要求一次完成全部资料。

### 3.4 Establish a baseline

同一真实问题先进行一次普通对话，不使用 AIIR 指令或资料。保留结果作为对照，然后再使用 AIIR 流程处理同一问题。

## 4. Required scenarios

至少完成：

### Scenario A — Guided research

从一个模糊请求开始，例如：

> 我想了解某家公司，但不知道该看什么。

观察系统是否主动生成研究地图、寻找可靠来源、解释术语、暴露未知并控制结论范围。

### Scenario B — Asset allocation discussion

使用真实但最小化的目标、期限、流动性和组合摘要，讨论风险与候选方案。观察系统是否在信息不足时拒绝直接给出伪精确比例。

### Scenario C — Decision and review

记录一次买入、卖出、继续持有、放弃或暂不行动的真实决定。之后使用原始记录复盘过程质量，而不是只根据盈亏评价。

## 5. Session record

每次试点至少保留：

- 用户最初的自然语言问题；
- 使用的个人上下文；
- 关键来源；
- 系统主动补充的问题；
- 已知、推断、未知和反方证据；
- 最终下一步或决定；
- 与普通对话的差异；
- 发生的具体摩擦。

可以只保存脱敏摘要和来源链接，不需要把完整私人对话提交 Git。

## 6. Friction logging

只有具体、可重复的困难才进入摩擦日志，例如：

- 每次都要重新整理同一持仓事实；
- 模型无法可靠恢复原始决策记录；
- 官方文件发现过程重复且容易漏；
- 财务计算经常需要人工校验；
- 项目工具无法将定期任务与私有文件结合；
- 对照结果表明固定流程明显更稳定，但人工执行成本过高。

“未来可能需要”“行业产品都有”或“架构看起来应该有”不算证据。

## 7. Software decision

一个候选功能只有通过 `PROJECT_STATUS.md` 的进入门槛，才创建独立 PRD 或代码。

可能的结果有三种：

1. **No software needed:** 成熟工具和文件已经足够；
2. **Thin local tool:** 只实现一个明确缺口，例如本地持仓事实库或决策日志；
3. **Continue validation:** 证据不足，继续人工试点。

不允许从一个摩擦直接推导出完整平台。

## 8. Pilot completion

试点完成的最低条件：

- 三类场景均至少真实执行一次；
- 每类场景都有普通对话对照；
- 已按 `docs/EVALUATION.md` 评分；
- 已记录重复摩擦或明确记录“没有稳定缺口”；
- 项目负责人作出继续、缩小或停止软件化的决定。
