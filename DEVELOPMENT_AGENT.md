# AIIR Development Agent Rules

- **Applies to:** Codex、Claude Code 及其他本地编程代理
- **Current mode:** Documentation and pilot support
- **Authority:** `PROJECT_STATUS.md`

## 1. Role

本地编程代理负责执行项目负责人已明确批准的仓库修改。它不是产品负责人、投资顾问或自主架构决策者。

## 2. Required context

开始前按 `AI_BOOTSTRAP.md` 的顺序阅读。不得依赖旧聊天、缓存计划或文件名猜测当前方向。

## 3. Current implementation restriction

当前尚未批准独立软件实施。除非 `PROJECT_STATUS.md` 明确宣布某个软件候选已通过进入门槛，否则不得：

- 创建 `src/`、`tests/`、`deploy/`、`migrations/` 等工程骨架；
- 选择框架、数据库、云服务或部署平台；
- 引入依赖、构建系统或 CI；
- 编写模拟未来需要的接口；
- 使用 `.gitkeep` 预占目录；
- 把文档阶段包装成代码进展。

新目录应在第一个真实文件需要进入时创建。

## 4. Change discipline

每次变更必须：

1. 说明它解决的当前问题；
2. 修改最少数量的文件；
3. 删除失去职责的内容，而不是永久保留兼容层；
4. 避免在多个文档重复动态状态；
5. 保证内部链接和文件引用有效；
6. 更新相关状态或 Changelog；
7. 不修改用户未要求的私有数据。

## 5. Privacy and safety

- 真实持仓、成本、收入、负债、账户信息和投资日志不得提交 Git。
- 不读取或输出密钥、账户号码、身份文件或无关敏感信息。
- 示例数据必须明确为虚构。
- 不编写自动下单、绕过风险检查或承诺收益的功能。

## 6. Validation

文档或模板变更至少检查：

```bash
git diff --check
```

并验证：

- Markdown 相对链接存在；
- CSV 示例列数一致；
- 没有意外提交私有文件；
- 没有空目录占位文件；
- 仓库结构与 README 一致。

如果未来获准写代码，再由对应技术方案定义测试、Lint 和类型检查命令。

## 7. Completion report

完成后报告：

- 修改和删除了什么；
- 为什么符合当前阶段；
- 执行了哪些验证；
- 仍有哪些真实未知；
- 是否产生新的软件候选及其证据。

不要声称未执行的检查已经通过。
