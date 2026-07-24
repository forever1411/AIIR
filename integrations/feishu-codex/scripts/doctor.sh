#!/usr/bin/env bash
set -u

user_home=$(getent passwd "$(id -u)" | cut -d: -f6)
config_base=${XDG_CONFIG_HOME:-"$user_home/.config"}
state_base=${XDG_STATE_HOME:-"$user_home/.local/state"}
environment_file="$config_base/aiir-feishu-codex/env"
state_file="$state_base/aiir-feishu-codex/state.json"
unit_dir="$config_base/systemd/user"
app_server_url="ws://127.0.0.1:4500"
failed=0

read_env_value() {
  local key=$1
  awk -v key="$key" '
    index($0, key "=") == 1 {
      value = substr($0, length(key) + 2)
    }
    END {
      print value
    }
  ' "$environment_file"
}

check_file() {
  local label=$1
  local target=$2
  if [[ -f "$target" ]]; then
    mode=$(stat -c '%a' "$target")
    echo "通过：$label（权限 $mode）"
    if [[ "$mode" != "600" ]]; then
      echo "警告：$target 建议使用 600 权限"
      failed=1
    fi
  else
    echo "缺少：$label（$target）"
    failed=1
  fi
}

check_private_config() {
  local sandbox
  local repo_root
  local configured_state_path

  app_server_url=$(read_env_value CODEX_APP_SERVER_URL)
  sandbox=$(read_env_value FEISHU_CODEX_SANDBOX)
  repo_root=$(read_env_value AIIR_REPO_ROOT)
  configured_state_path=$(read_env_value AIIR_FEISHU_STATE_PATH)

  if [[ "$sandbox" == "read-only" ]]; then
    echo "通过：普通飞书消息以只读权限启动"
  else
    echo "失败：FEISHU_CODEX_SANDBOX 必须保持 read-only"
    failed=1
  fi
  if [[ "$app_server_url" =~ ^ws://(127\.0\.0\.1|localhost|\[::1\]):[0-9]+/?$ ]]; then
    echo "通过：飞书桥只连接本机回环 app-server"
  else
    echo "失败：CODEX_APP_SERVER_URL 不是允许的本机回环地址"
    app_server_url=
    failed=1
  fi
  if [[ -n "$repo_root" && -d "$repo_root" ]]; then
    echo "通过：AIIR 工作区路径有效"
  else
    echo "失败：AIIR_REPO_ROOT 缺失或目录不存在"
    failed=1
  fi

  if [[ -n "$configured_state_path" ]]; then
    state_file="$configured_state_path"
  fi
}

check_listener_unit() {
  local unit_file="$unit_dir/aiir-codex-app-server.service"
  if [[ ! -f "$unit_file" ]]; then
    echo "失败：缺少已安装的 app-server 用户服务"
    failed=1
    return
  fi
  if grep -Eq \
    '^ExecStart=.* app-server --listen ws://127\.0\.0\.1:[0-9]+$' \
    "$unit_file"; then
    echo "通过：Codex app-server 仅监听 127.0.0.1"
  else
    echo "失败：已安装的 app-server 服务未限定为 127.0.0.1"
    failed=1
  fi
}

check_service() {
  local service=$1
  if systemctl --user is-enabled --quiet "$service"; then
    echo "通过：$service 已设为自动启动"
  else
    echo "失败：$service 未启用自动启动"
    failed=1
  fi
  if systemctl --user is-active --quiet "$service"; then
    echo "通过：$service 正在运行"
  else
    echo "失败：$service 未运行"
    echo "请用 journalctl --user -u $service 查看已脱敏日志"
    failed=1
  fi
}

check_file "飞书私密配置" "$environment_file"
if [[ -f "$environment_file" ]]; then
  check_private_config
fi
if [[ -f "$state_file" ]]; then
  check_file "飞书配对状态" "$state_file"
else
  echo "等待：尚未生成配对状态，首次飞书配对后会自动出现"
fi
check_listener_unit
check_service aiir-codex-app-server.service
check_service aiir-feishu-codex.service

if [[ -n "$app_server_url" ]]; then
  ready_url="http://${app_server_url#ws://}"
  ready_url="${ready_url%/}/readyz"
  if curl -fsS "$ready_url" >/dev/null 2>&1; then
    echo "通过：Codex app-server 健康检查"
  else
    echo "失败：Codex app-server 健康检查"
    failed=1
  fi
else
  echo "跳过：app-server 地址不安全，不执行健康检查"
fi

exit "$failed"
