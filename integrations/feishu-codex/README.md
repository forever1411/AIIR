# AIIR 飞书 ↔ Codex 桥

这个桥让手机飞书成为 AIIR 的安全远程入口：

```text
飞书私聊或群聊 @机器人
→ 飞书长连接
→ 本机桥接服务
→ Codex app-server
→ 同一条可恢复的 Codex thread
→ 回复飞书
```

它还提供一个单向通知命令，可让市场监控在出现重要变化时主动推送到最近完成配对的飞书会话。

## 安全边界

- 飞书凭证、配对码和用户 ID 只放在本机配置，不进入 Git；
- 首次使用必须在私聊中输入配对码，之后只接受已绑定账号；
- 群聊默认必须 `@机器人`；
- 普通飞书消息使用 `read-only`；只有显式 `/aiir write` 才为当前一轮使用 `workspace-write`；
- 写权限只覆盖 AIIR 工作区，下一条普通消息自动恢复只读；
- 远程入口不执行交易，不做 Git commit/push，不处理交互式审批；
- `codex app-server` 只监听 `127.0.0.1`，不能直接暴露到公网。

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

如需看详细日志：

```bash
journalctl --user -u aiir-feishu-codex.service -f
```

## 三、手机首次配对

在飞书里找到机器人并私聊：

```text
/aiir pair 你在配置文件里设置的配对码
```

成功后可直接发自然语言，也可使用：

```text
/aiir help
/aiir status
/aiir thread
/aiir new
/aiir ask 帮我解释今天持仓为什么比大盘抗跌
/aiir write 更新今天的研究记录并检查格式
```

群聊中需要先 `@机器人`。

`/aiir write` 是逐轮授权。它允许 Codex 在 AIIR 仓库内修改文件并执行必要的本地验证，但不允许 Git commit/push、交易或仓库外的破坏性操作。需要继续修改时，每一条新任务都要再次使用 `/aiir write`。

## 四、让终端接入同一条会话

在飞书发送 `/aiir thread`，机器人会返回 thread ID 和完整命令，形式如下：

```bash
codex resume THREAD_ID --remote ws://127.0.0.1:4500
```

飞书和这个终端连接的是同一个 app-server/thread，不是模拟键盘输入。当前已经单独启动的旧 Codex 窗口不会自动热切换；执行上述命令打开的新终端会话才与飞书共享上下文。

也可以直接在仓库根目录运行：

```bash
bash integrations/feishu-codex/scripts/connect.sh
```

该脚本会启动已经安装的用户服务，从本机私密状态中读取当前 thread ID，然后让终端接入飞书正在使用的同一条会话。

## 五、退出、重启与恢复

- 关闭当前 Codex 终端窗口不会关闭飞书桥。Codex app-server 和飞书桥是独立的 systemd 用户服务。
- 桥接服务重启后会读取本机状态文件并恢复原 thread；如果原 thread 确实无法恢复，才会新建 thread 并保存新 ID。
- 电脑重启后，已启用的用户服务会在该用户登录后自动启动。若电脑关机、休眠或尚未登录，飞书入口不会在线。
- 普通执行 `codex` 会打开另一条本地会话，不会自动接入飞书 thread。要共享上下文，请运行 `bash integrations/feishu-codex/scripts/connect.sh`，或使用 `/aiir thread` 返回的完整命令。
- 仓库只保存程序、服务模板和说明。App Secret、配对码、已授权用户、最近聊天和 thread ID 故意保存在本机，不进入 Git。
- 因此，同一台机器退出窗口或重启后可以恢复；换新机器或只重新克隆仓库时，需要重新运行 `scripts/setup.sh`、完成配对并建立本机状态，不能只靠 Git 中的文件恢复私密连接。

## 六、主动发送一条通知

完成首次配对后：

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

只有达到监控协议中的报告门槛时，才应调用这个通知命令。

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
