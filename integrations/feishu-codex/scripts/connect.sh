#!/usr/bin/env bash
set -euo pipefail

mode=resume
if (( $# > 1 )); then
  echo "用法：$0 [--fresh]"
  exit 2
fi
if (( $# == 1 )); then
  if [[ "$1" != "--fresh" ]]; then
    echo "不支持的参数：$1"
    echo "用法：$0 [--fresh]"
    exit 2
  fi
  mode=fresh
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
integration_root=$(cd -- "$script_dir/.." && pwd)
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

if ! systemctl --user start aiir-codex-app-server.service; then
  echo "无法启动 Codex app-server。请先运行 integrations/feishu-codex/scripts/setup.sh。"
  exit 1
fi

bridge_needs_start=0
restore_bridge() {
  if (( bridge_needs_start )); then
    systemctl --user start aiir-feishu-codex.service >/dev/null 2>&1 || true
  fi
}
trap restore_bridge EXIT

if [[ "$mode" == "fresh" ]]; then
  if ! systemctl --user stop aiir-feishu-codex.service; then
    echo "无法暂停飞书桥，未开始切换 thread。"
    exit 1
  fi
  bridge_needs_start=1
  if ! "$node_bin" --env-file="$environment_file" \
    "$integration_root/src/reset-thread.mjs" \
    >/dev/null; then
    echo "无法创建新 thread；飞书桥将恢复启动。"
    exit 1
  fi
  if ! systemctl --user start aiir-feishu-codex.service; then
    echo "新 thread 已保存，但飞书桥启动失败，请运行 doctor.sh 检查。"
    exit 1
  fi
  bridge_needs_start=0
  echo "已切换到新 thread，并已请求删除旧 thread"
else
  if ! systemctl --user restart aiir-feishu-codex.service; then
    echo "无法重启飞书桥服务。请运行 integrations/feishu-codex/scripts/doctor.sh 检查。"
    exit 1
  fi
fi

if ! thread_id=$(
  "$node_bin" --env-file="$environment_file" \
    "$integration_root/src/wait-thread.mjs"
); then
  echo "飞书桥已启动，但没有得到可恢复的 Codex thread。"
  echo "请运行 integrations/feishu-codex/scripts/doctor.sh 检查。"
  exit 1
fi

trap - EXIT

if "$node_bin" --env-file="$environment_file" \
  "$integration_root/src/notify.mjs" \
  "AIIR 飞书桥已连接，本机 Codex 正在接入同一会话。" \
  >/dev/null 2>&1; then
  echo "飞书主动通知测试成功"
else
  echo "提示：飞书主动通知测试未完成，不影响终端接入。"
  echo "如果尚未建立通知目标，请先用已授权账号私聊机器人一次。"
fi

echo "正在接入飞书使用的 Codex thread：$thread_id"
exec "$codex_bin" \
  --ask-for-approval never \
  --sandbox workspace-write \
  resume "$thread_id" \
  --remote "$app_server_url"
