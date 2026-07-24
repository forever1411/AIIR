#!/usr/bin/env bash
set -euo pipefail

codex_bin=$(command -v codex)
node_bin=$(command -v node)
user_home=$(getent passwd "$(id -u)" | cut -d: -f6)
config_base=${XDG_CONFIG_HOME:-"$user_home/.config"}
state_base=${XDG_STATE_HOME:-"$user_home/.local/state"}
environment_file="$config_base/aiir-feishu-codex/env"

if [[ ! -f "$environment_file" ]]; then
  echo "缺少飞书桥配置：$environment_file"
  echo "请先运行 integrations/feishu-codex/scripts/setup.sh。"
  exit 1
fi

configured_state_path=$(
  sed -n 's/^AIIR_FEISHU_STATE_PATH=//p' "$environment_file" | tail -n 1
)
configured_app_server_url=$(
  sed -n 's/^CODEX_APP_SERVER_URL=//p' "$environment_file" | tail -n 1
)
state_file=${configured_state_path:-"$state_base/aiir-feishu-codex/state.json"}
app_server_url=${configured_app_server_url:-"ws://127.0.0.1:4500"}

if [[ ! -f "$state_file" ]]; then
  echo "缺少飞书桥状态：$state_file"
  echo "请先在飞书中完成配对并发送一条消息。"
  exit 1
fi

thread_id=$(
  "$node_bin" -e '
    const fs = require("node:fs");
    const state = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    if (typeof state.threadId !== "string" || state.threadId.length === 0) {
      throw new Error("状态文件中没有可恢复的 threadId");
    }
    process.stdout.write(state.threadId);
  ' "$state_file"
)

if ! systemctl --user start \
  aiir-codex-app-server.service \
  aiir-feishu-codex.service; then
  echo "无法启动飞书桥服务。请先运行 integrations/feishu-codex/scripts/setup.sh。"
  exit 1
fi

echo "正在接入飞书使用的 Codex thread：$thread_id"
exec "$codex_bin" resume "$thread_id" --remote "$app_server_url"
