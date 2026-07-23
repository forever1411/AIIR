# 开发环境

## 1. 当前环境

- 操作系统：Ubuntu；
- 版本管理：Git；
- 远程仓库：GitHub；
- 本地编程代理：Codex、Claude Code 或其他工具；
- 当前阶段：文档和试点，不要求安装应用依赖。

## 2. 推荐基础工具

```bash
git --version
python3 --version
```

进入软件阶段后建议：

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

具体命令以未来 `pyproject.toml` 为准，不提前维护不存在的安装步骤。

## 3. 私有工作目录

```bash
mkdir -p workspace/private
chmod 700 workspace/private
```

真实个人数据放入该目录，并确认：

```bash
git check-ignore -v workspace/private/example.txt
```

## 4. 密钥

- 真实密钥写入 `.env` 或系统密钥管理；
- `.env` 不提交 Git；
- Prompt、日志和测试不得包含真实密钥；
- ChatGPT-first 试点无需 API Key。

## 5. 编程代理要求

工具必须能够：

- 读取仓库；
- 生成最小 diff；
- 执行测试和静态检查；
- 不擅自提交或推送；
- 遵守 `DEVELOPMENT_AGENT.md`；
- 尊重私有目录和联网边界。

## 6. 开发启动检查

```bash
git status
git branch --show-current
git diff --check
```

开始实现前还必须确认 `PROJECT_STATUS.md` 已批准当前软件任务。
