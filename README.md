# AIIR

**AIIR — AI Investment Reflection**

AIIR 是一个由用户长期拥有、由 GitHub 保存上下文、由成熟大模型提供智能能力的个人投资学习、研究与决策辅助系统。

```text
GitHub 仓库
= 身份、规则、当前状态、长期记忆和重要历史

成熟大模型
= 检索、解释、研究、推理、质疑和交互能力

用户
= 目标设定者、信息确认者和最终决策者
```

## 目的

AIIR 面向投资经验有限、尚未形成完整研究与决策方法的个人用户。它应主动帮助用户：

- 明确当前真正需要解决的问题；
- 知道从哪里开始、应该问什么、应该看什么；
- 找到并理解可靠资料；
- 区分事实、推断、观点和噪声；
- 识别风险、未知和反方证据；
- 判断作出决定前还缺少什么；
- 保存重要背景、决定和经验；
- 在后续会话中恢复上下文并继续工作。

## 运行闭环

```text
启动会话
→ 读取系统内核
→ 恢复当前状态与长期记忆
→ 处理本次问题
→ 识别值得固化的信息
→ 必要时向用户确认
→ 输出文件更新或 patch
→ 用户提交 Git
→ 下次继续
```

仓库中经过用户确认并提交的内容，是 AIIR 的正式上下文。平台记忆、聊天历史和模型推断可以提供线索，但不能覆盖仓库事实。

## 开始一次会话

向能够读取本仓库的成熟大模型发送：

```text
继续 AIIR。

GitHub：
https://github.com/forever1411/AIIR.git

请先阅读 AI_BOOTSTRAP.md。
```

模型应按照启动协议恢复身份、规则、状态和记忆，然后直接处理用户当前请求。

## 收尾一次会话

用户可以发送：

```text
收尾 AIIR，检查本次需要固化的信息并给我 patch。
```

即使用户没有使用固定口令，只要会话形成了对未来有用的新状态、事实、偏好、决定或经验，模型也应主动执行保存检查。

## 仓库结构

```text
AIIR/
├── README.md
├── AI_BOOTSTRAP.md
├── CURRENT_STATE.md
├── MEMORY.md
├── JOURNAL.md
├── CHANGELOG.md
└── docs/
    ├── VISION.md
    ├── CHATGPT_ROLE.md
    ├── PRINCIPLES.md
    └── INTERACTION_PROTOCOL.md
```

### 系统内核

- [`docs/VISION.md`](docs/VISION.md)：AIIR 的定位、目标和运行模型。
- [`docs/CHATGPT_ROLE.md`](docs/CHATGPT_ROLE.md)：大模型在 AIIR 中的职责和边界。
- [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)：长期有效的基本原则。
- [`docs/INTERACTION_PROTOCOL.md`](docs/INTERACTION_PROTOCOL.md)：会话启动、运行、确认和保存协议。

### 运行数据

- [`CURRENT_STATE.md`](CURRENT_STATE.md)：当前有效的目标、问题、缺口和下一步。
- [`MEMORY.md`](MEMORY.md)：经过确认、未来仍会影响协作的长期用户信息。
- [`JOURNAL.md`](JOURNAL.md)：按时间追加的重要讨论、决定和复盘记录。

### 系统维护

- [`CHANGELOG.md`](CHANGELOG.md)：仓库结构和正式协议的变更记录。

## 边界

AIIR 提供学习、研究和决策支持，但：

- 不自动交易或连接券商；
- 不承诺收益、保值或确定结果；
- 不把模型的专业表达等同于真实经验或可靠业绩；
- 不替用户承担最终决策和风险；
- 不要求用户先掌握专业术语或提出完整问题；
- 不提前创建没有真实用途的文件、目录或流程。

新的内容结构只在实际需要出现时扩展。
