# AIIR 飞书 ↔ Codex 桥

这个桥让手机飞书成为 AIIR 的安全远程入口：

```text
飞书私聊，或白名单群聊 @机器人
→ 飞书长连接
→ 本机桥接服务
→ Codex app-server
→ 同一条可恢复的 Codex thread
→ 回复飞书
```

它还提供一个单向通知命令，可让市场监控在出现重要变化时主动推送到最近一次已授权私聊。主动通知不会以群聊作为目标。

## 安全边界

- 飞书凭证、配对码和用户 ID 只放在本机配置，不进入 Git；
- 首次使用必须在私聊中输入配对码；配对码默认只允许完成第一次绑定，之后只接受已绑定账号或本机显式配置的 open ID；
- 群聊默认关闭；只有 `FEISHU_ALLOWED_GROUP_CHAT_IDS` 中的群可在 `@机器人` 后使用，并且只开放 `help`、`status` 和只读 `ask`；
- 全局沙箱强制保持 `read-only`；只有显式 `/aiir write` 才为当前一轮使用 `workspace-write`；
- 写权限只覆盖 AIIR 工作区，下一条普通消息自动恢复只读；
- `CODEX_APP_SERVER_URL` 会在启动时校验，只允许无凭证的本机回环 `ws://127.0.0.1`、`localhost` 或 `::1` 地址；
- 飞书事件按 message ID 轻量去重：写任务先登记以避免重复执行，只读任务成功后登记以便临时失败时重试；
- 主动通知只发送到最近一次已授权私聊；群聊不会覆盖通知目标；
- 飞书 SDK 只记录警告和错误；常见凭证与会话标识会被清理，启动日志不打印 thread ID，聊天错误不回显底层异常详情；
- 远程入口不执行交易，不做 Git commit/push，不处理交互式审批。

## 一、在飞书开放平台创建应用

1. 打开飞书开放平台，创建“企业自建应用”；
2. 在“应用能力”中启用机器人；
3. 在“权限管理”中开通：
   - 读取用户发给机器人的单聊消息；
   - 接收群聊中 `@机器人` 的消息；
   - 以应用身份发送消息；
4. 在“事件与回调”中选择“使用长连接接收事件”；
5. 添加事件 `im.message.receive_v1`（接收消息）；
6. 创建并发布一个版本，确保你的飞书账号在可用范围内；
7. 从“凭证与基础信息”复制 App ID 和 App Secret。

长连接模式不需要公网 IP、域名或内网穿透，但运行这两个服务的电脑必须开机并联网。

## 二、一键配置本机服务

```bash
cd /home/admin/AIIR/integrations/feishu-codex
bash scripts/setup.sh
```

脚本会在本机终端询问 App ID 和 App Secret。App Secret 输入时不会显示；脚本会自动生成配对码、安装依赖、创建权限为 `600` 的私密配置，并启动两个用户服务。真实凭证不会写入仓库。

查看状态：

```bash
bash scripts/doctor.sh
```

`doctor.sh` 检查当前机器的私密文件权限、只读基线、回环地址、服务安装与运行状态以及 app-server 健康状态；它不会显示密钥、配对码或用户标识。

仓库更新或依赖变化后，同时执行：

```bash
npm run check
npm test
npm audit --omit=dev
```

如需看详细日志：

```bash
journalctl --user -u aiir-feishu-codex.service -f
```

## 三、手机首次配对

在飞书里找到机器人并私聊：

```text
/aiir pair 你在配置文件里设置的配对码
```

成功后配对入口自动关闭。需要增加其他账号时，应在本机私密配置中明确加入对应 open ID，而不是重复共享配对码。随后可直接发自然语言，也可使用：

```text
/aiir help
/aiir status
/aiir thread
/aiir new
/aiir ask 帮我解释今天持仓为什么比大盘抗跌
/aiir write 更新今天的研究记录并检查格式
```

群聊默认不可用。确需启用时，在本机私密配置中把明确的 `chat_id` 加入 `FEISHU_ALLOWED_GROUP_CHAT_IDS`，重启桥接服务后再 `@机器人`。即使进入白名单，群聊仍然只能查看帮助、状态和发送只读问题；配对、thread ID、新建会话与写任务必须在私聊中完成。

`/aiir write` 是逐轮授权。它允许 Codex 在 AIIR 仓库内修改文件并执行必要的本地验证，但不允许 Git commit/push、交易或仓库外的破坏性操作。需要继续修改时，每一条新任务都要再次使用 `/aiir write`。

## 四、让终端接入同一条会话

恢复当前 thread：

```bash
bash integrations/feishu-codex/scripts/connect.sh
```

明确删除旧 thread 并从空白会话开始：

```bash
bash integrations/feishu-codex/scripts/connect.sh --fresh
```

普通模式会重启飞书桥、等待状态中的 thread 通过 app-server 的实际恢复检查，再发送一条主动通知测试。若原 ID 没有可恢复的 rollout，桥会先创建并持久化新 thread，连接脚本会等待状态切换完成，不会继续使用旧 ID。

`--fresh` 会先暂停飞书桥，创建并持久化新 thread，确认成功后保存新 ID，再通过 app-server 的 `thread/delete` 删除旧 thread；随后连接脚本同样等待新 ID 通过实际恢复检查，再让飞书桥和本机终端共同切换过去。新 thread 无法持久化或状态保存失败时不会删除旧 thread；旧 thread 删除请求本身失败时会明确警告，但仍使用已经持久化的新 thread。不要在飞书仍有任务处理中时使用 `--fresh`。

无论是否使用 `--fresh`，本机终端都以 `--ask-for-approval never --sandbox workspace-write` 接入，只允许在 AIIR 工作区内直接读写且不弹交互审批。飞书权限保持独立：普通飞书消息仍是只读，只有 `/aiir write` 才为对应一轮开放工作区写权限。

`--fresh` 只更换 Codex thread，不会清除已配对飞书账号或私聊通知目标，因此同一台机器上手机端通常不需要操作。只有尚未建立通知目标时，才需要用已授权账号私聊机器人一次。

本机终端打开并连接同一 thread 时，可以看到之后由飞书发起的消息和最终回答；飞书桥只把自己发起的 turn 的最终回答返回飞书，不会把本机终端中的普通对话、推理过程、工具调用或中间输出主动转发到飞书。

在飞书发送 `/aiir thread`，机器人也会返回当前 thread ID 和带有本机读写权限的完整接入命令。当前已经单独启动的旧 Codex 窗口不会自动热切换；新打开的终端会话才与飞书共享上下文。

## 五、退出、重启与恢复

- 关闭当前 Codex 终端窗口不会关闭飞书桥。Codex app-server 和飞书桥是独立的 systemd 用户服务。
- 桥接服务重启后会读取本机状态文件并恢复原 thread；如果原 thread 确实无法恢复，才会新建 thread 并保存新 ID。
- 电脑重启后，已启用的用户服务会在该用户登录后自动启动。若电脑关机、休眠或尚未登录，飞书入口不会在线。
- 普通执行 `codex` 会打开另一条本地会话，不会自动接入飞书 thread。要共享上下文，请运行 `bash integrations/feishu-codex/scripts/connect.sh`，或使用 `/aiir thread` 返回的完整命令。
- 普通 `connect.sh` 恢复原 thread；只有显式 `--fresh` 才主动创建新 thread 并请求删除旧 thread。原 thread 无法恢复时，桥仍会自动切换到已持久化的新 thread；连接脚本会等待最终 ID 真正可恢复后再启动终端。两种模式都保持 Codex app-server 运行，并以本机工作区读写权限启动终端。
- 仓库只保存程序、服务模板和说明。App Secret、配对码、已授权用户、私聊通知目标和 thread ID 故意保存在本机，不进入 Git。
- 状态格式升级到版本 2 后，旧版 `lastChatId` 不会自动继承为通知目标。升级后请用已授权账号私聊机器人一次，再使用主动通知；这是为了避免旧群聊被静默当成通知目标。
- 因此，同一台机器退出窗口或重启后可以恢复；换新机器或只重新克隆仓库时，需要重新运行 `scripts/setup.sh`、完成配对并建立本机状态，不能只靠 Git 中的文件恢复私密连接。

## 六、主动发送一条通知

完成首次配对并由已授权账号私聊至少一次后：

```bash
cd /home/admin/AIIR/integrations/feishu-codex
node --env-file=/home/admin/.config/aiir-feishu-codex/env \
  src/notify.mjs "AIIR 测试通知"
```

也可以从标准输入读取：

```bash
some_monitor_command | node \
  --env-file=/home/admin/.config/aiir-feishu-codex/env \
  src/notify.mjs --stdin
```

只有达到监控协议中的报告门槛时，才应调用这个通知命令。通知目标始终是最近一次已授权私聊，不会发往群聊。

## 七、仓库审计与本机验证边界

仓库级审计可以检查代码、配置模板、锁定依赖和测试，但不能代替对实际运行机器的检查。仅凭 README 或仓库代码，不得宣称本机环境已经安全验证。

应用本次安全更新后，至少在运行机器执行：

```bash
cd /home/admin/AIIR/integrations/feishu-codex
npm run check
npm test
npm audit --omit=dev
bash scripts/doctor.sh
systemctl --user status aiir-codex-app-server.service --no-pager
systemctl --user status aiir-feishu-codex.service --no-pager
```

还应人工确认：

- 私密配置和状态文件权限为 `600`，所在目录权限为 `700`；
- app-server 只监听本机回环地址；
- 日志中没有 App Secret、配对码、chat ID、open ID 或 thread ID；
- 群聊变量默认留空，只有确有需要的群才加入白名单；
- `npm audit`、服务状态或实际日志发现的问题已经单独处理。

当前锁定的 `ws` 版本为 8.21.1，已高于已知拒绝服务问题的修复版本 8.21.0；这只说明仓库锁定版本不落在该已知受影响范围内，不证明运行机器已经安装同一依赖树。

## 提交前检查

建议提交：

- 根目录 `README.md`、`CHANGELOG.md`；
- 本目录的 `README.md`、`.env.example`、`.gitignore`、`package.json` 和 `package-lock.json`；
- `src/`、`scripts/`、`systemd/` 和 `test/`。

不要提交：

- `.env` 或本机配置目录中的 `env`；
- `node_modules/`；
- `state.json`、飞书用户 ID、chat ID、thread ID、App Secret 或配对码；
- 运行日志。

## 停止与卸载

暂停：

```bash
systemctl --user stop aiir-feishu-codex.service
systemctl --user stop aiir-codex-app-server.service
```

取消开机启动：

```bash
systemctl --user disable aiir-feishu-codex.service
systemctl --user disable aiir-codex-app-server.service
```

本机私密状态默认位于：

```text
/home/admin/.local/state/aiir-feishu-codex/state.json
```
