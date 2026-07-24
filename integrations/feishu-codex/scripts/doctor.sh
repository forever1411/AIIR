#!/usr/bin/env bash
set -u

user_home=$(getent passwd "$(id -u)" | cut -d: -f6)
config_base=${XDG_CONFIG_HOME:-"$user_home/.config"}
state_base=${XDG_STATE_HOME:-"$user_home/.local/state"}
environment_file="$config_base/aiir-feishu-codex/env"
state_file="$state_base/aiir-feishu-codex/state.json"
failed=0

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

check_service() {
  local service=$1
  if systemctl --user is-active --quiet "$service"; then
    echo "通过：$service 正在运行"
  else
    echo "失败：$service 未运行"
    systemctl --user status "$service" --no-pager -n 5 || true
    failed=1
  fi
}

check_file "飞书私密配置" "$environment_file"
if [[ -f "$state_file" ]]; then
  check_file "飞书配对状态" "$state_file"
else
  echo "等待：尚未生成配对状态，首次飞书配对后会自动出现"
fi
check_service aiir-codex-app-server.service
check_service aiir-feishu-codex.service

if curl -fsS http://127.0.0.1:4500/readyz >/dev/null 2>&1; then
  echo "通过：Codex app-server 健康检查"
else
  echo "失败：Codex app-server 健康检查"
  failed=1
fi

exit "$failed"
