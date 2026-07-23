# AIIR

**AIIR — AI Investment Reflection**

AIIR 是一个由 GitHub 驱动、由成熟大模型运行的个人投资学习、研究与决策辅助系统。

它不是准备开发的软件应用，也不是一个试图超越 ChatGPT、Claude、Gemini 或未来模型的独立 AI。AIIR 将模型已经具备的检索、解释、推理和对话能力，与一套由用户长期拥有、可版本化、可审计的个人上下文结合起来。

```text
GitHub 仓库
= AIIR 的长期记忆、当前状态、规则和历史

成熟大模型
= AIIR 的研究、解释、推理、质疑和交互能力
```

## 为什么存在

用户目前投资经验有限。真正的困难不只是缺少答案，还包括：

- 不知道从哪里开始；
- 不知道应该问什么；
- 不知道应该看哪些资料；
- 不知道哪些信息重要、哪些只是噪声；
- 难以判断事实、推断和营销话术；
- 不知道做决定前还缺什么；
- 容易受到价格波动、情绪和确认偏误影响；
- 很难保存并复盘过去为什么做过某个决定。

AIIR 的职责是主动帮助用户发现问题、建立研究路径、理解资料、检查风险、形成可复盘记录，并在后续会话中恢复这些上下文。

## 最小运行闭环

```text
启动
→ 读取系统内核
→ 恢复当前状态与长期记忆
→ 根据本次请求工作
→ 识别值得固化的新信息
→ 必要时与用户确认
→ 输出仓库更新或 patch
→ 用户提交 Git
→ 下次继续
```

GitHub 是唯一正式事实来源。聊天记忆、旧对话和模型自行推测都不能替代仓库中的已确认内容。

## 如何开始一次会话

向支持读取 GitHub 仓库的成熟大模型发送：

```text
继续 AIIR。

GitHub：
https://github.com/forever1411/AIIR.git

请先阅读 AI_BOOTSTRAP.md。
```

模型应按照启动协议恢复身份、规则、状态和记忆，然后直接继续当前工作。

## 如何结束一次会话

用户不需要手工整理本次对话。模型应主动识别可能需要长期保存的内容，并：

1. 区分当前状态、长期记忆和历史记录；
2. 对不确定或可能误解的个人信息向用户确认；
3. 给出建议修改的文件；
4. 在确认后输出完整内容或标准 patch；
5. 不声称远程仓库已更新，除非确实完成了提交。

用户也可以直接说：

```text
收尾 AIIR，检查本次需要固化的信息并给我 patch。
```

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

### 稳定系统内核

- [`docs/VISION.md`](docs/VISION.md)：AIIR 为什么存在、希望实现什么。
- [`docs/CHATGPT_ROLE.md`](docs/CHATGPT_ROLE.md)：成熟大模型在 AIIR 中应扮演什么角色。
- [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)：长期有效、不能轻易违反的原则。
- [`docs/INTERACTION_PROTOCOL.md`](docs/INTERACTION_PROTOCOL.md)：启动、运行、确认和保存协议。

### 动态运行数据

- [`CURRENT_STATE.md`](CURRENT_STATE.md)：当前有效的工作状态和下一步。
- [`MEMORY.md`](MEMORY.md)：经过确认、未来仍会影响协作的长期信息。
- [`JOURNAL.md`](JOURNAL.md)：按时间追加的重要讨论、决定和演进记录。

### 维护记录

- [`CHANGELOG.md`](CHANGELOG.md)：仓库结构和正式协议的变化，不记录普通会话流水。

## 当前边界

AIIR 当前：

- 不开发独立本地程序；
- 不自建基础模型；
- 不自动交易或连接券商；
- 不承诺收益、保值或确定结果；
- 不把模型的专业表达等同于真实经验；
- 不要求用户先学会提出专业问题；
- 不提前创建没有真实内容的目录、模板和体系。

新的文件或目录只在第一次产生真实需求和真实内容时创建。
