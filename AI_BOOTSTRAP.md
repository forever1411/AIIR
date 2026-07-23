# AIIR Bootstrap

本文件用于让新的 AI 会话、本地编程代理或人工协作者快速恢复项目上下文。

## Required reading order

1. `README.md`
2. `PROJECT_STATUS.md`
3. `docs/VISION.md`
4. `docs/PRINCIPLES.md`
5. `docs/PILOT.md`
6. 与当前任务相关的 `docs/WORKFLOWS.md` 或 `docs/EVALUATION.md`
7. 涉及仓库修改时再读 `DEVELOPMENT_AGENT.md`

动态进度只以 `PROJECT_STATUS.md` 为准。不要从 README、历史 Changelog 或旧对话推断当前 Sprint。

## Current project truth

- AIIR 当前是个人投资学习与决策流程，不是已获准实施的软件平台。
- 成熟大模型是分析引擎，不是竞争对象。
- 当前任务是验证实际增益，而不是补齐预想中的技术架构。
- 项目负责人投资经验有限，系统必须主动生成问题并解释过程。
- 模型不能被包装为拥有真实几十年投资经验的权威。
- 最终决定属于项目负责人。

## Before changing the repository

确认：

- 变更是否服务当前试点；
- 是否有真实使用证据；
- 是否可以通过修改 Prompt、模板或工作流解决；
- 是否引入了无内容目录、占位文件或提前抽象；
- 是否影响个人隐私和投资安全；
- 是否同步更新 `PROJECT_STATUS.md`。

## Default behavior

当任务不明确时，优先保持仓库简单，不创建代码、框架、数据库或部署结构。提出并记录最小可验证步骤。
