# AIIR Private Data Templates

这些文件只包含虚构示例，用于创建不进入 Git 的个人工作区。

在仓库根目录执行：

```bash
mkdir -p workspace/private
cp templates/investment_profile.example.md workspace/private/investment_profile.md
cp templates/portfolio.example.csv workspace/private/portfolio.csv
cp templates/watchlist.example.csv workspace/private/watchlist.csv
cp templates/investment_rules.example.md workspace/private/investment_rules.md
cp templates/decision_journal.example.md workspace/private/decision_journal.md
cp templates/friction_log.example.md workspace/private/friction_log.md
```

首次使用只复制当前场景需要的文件，不要求一次填写全部资料。

`workspace/` 已被 `.gitignore` 排除。不要提交真实持仓、成本、账户信息、收入负债、个人财务背景或完整投资日志。
