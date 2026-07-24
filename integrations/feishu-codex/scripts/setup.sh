#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
integration_root=$(cd -- "$script_dir/.." && pwd)
repo_root=$(cd -- "$integration_root/../.." && pwd)
codex_bin=$(command -v codex)
node_bin=$(command -v node)
user_home=$(getent passwd "$(id -u)" | cut -d: -f6)
config_base=${XDG_CONFIG_HOME:-"$user_home/.config"}
state_base=${XDG_STATE_HOME:-"$user_home/.local/state"}
bridge_config_dir="$config_base/aiir-feishu-codex"
bridge_state_dir="$state_base/aiir-feishu-codex"
environment_file="$bridge_config_dir/env"
unit_dir="$config_base/systemd/user"

if [[ -e "$environment_file" ]]; then
  echo "已存在私密配置：$environment_file"
  echo "为避免覆盖密钥，本次安装已停止。需要修改时请直接编辑该文件。"
  exit 1
fi

read -r -p "飞书 App ID（cli_ 开头）: " app_id
read -r -s -p "飞书 App Secret（输入时不会显示）: " app_secret
echo

if [[ ! "$app_id" =~ ^cli_[A-Za-z0-9_-]{8,}$ ]]; then
  echo "App ID 格式不正确。"
  exit 1
fi
if [[ ! "$app_secret" =~ ^[A-Za-z0-9_-]{8,}$ ]]; then
  echo "App Secret 格式不正确，或包含不支持的字符。"
  exit 1
fi

pairing_code=$(node -e \
  "process.stdout.write(require('node:crypto').randomBytes(16).toString('hex'))")

install -d -m 700 "$bridge_config_dir" "$bridge_state_dir"
environment_tmp=$(mktemp "$bridge_config_dir/env.XXXXXX")
cleanup() {
  if [[ -n "${environment_tmp:-}" && -e "$environment_tmp" ]]; then
    rm -f -- "$environment_tmp"
  fi
}
trap cleanup EXIT
chmod 600 "$environment_tmp"
{
  printf 'FEISHU_APP_ID=%s\n' "$app_id"
  printf 'FEISHU_APP_SECRET=%s\n' "$app_secret"
  printf 'FEISHU_PAIRING_CODE=%s\n' "$pairing_code"
  printf 'FEISHU_ALLOWED_OPEN_IDS=\n'
  printf 'FEISHU_ALLOWED_GROUP_CHAT_IDS=\n'
  printf 'CODEX_APP_SERVER_URL=ws://127.0.0.1:4500\n'
  printf 'AIIR_REPO_ROOT=%s\n' "$repo_root"
  printf 'FEISHU_CODEX_SANDBOX=read-only\n'
  printf 'AIIR_FEISHU_STATE_PATH=%s/state.json\n' "$bridge_state_dir"
} >"$environment_tmp"
mv "$environment_tmp" "$environment_file"
environment_tmp=
chmod 600 "$environment_file"

npm install --prefix "$integration_root"

install -d -m 700 "$unit_dir"
repo_escaped=$(printf '%s' "$repo_root" | sed 's/[&|]/\\&/g')
codex_escaped=$(printf '%s' "$codex_bin" | sed 's/[&|]/\\&/g')
node_escaped=$(printf '%s' "$node_bin" | sed 's/[&|]/\\&/g')
env_escaped=$(printf '%s' "$environment_file" | sed 's/[&|]/\\&/g')

sed \
  -e "s|@REPO_ROOT@|$repo_escaped|g" \
  -e "s|@CODEX_BIN@|$codex_escaped|g" \
  "$integration_root/systemd/aiir-codex-app-server.service" \
  >"$unit_dir/aiir-codex-app-server.service"
sed \
  -e "s|@REPO_ROOT@|$repo_escaped|g" \
  -e "s|@NODE_BIN@|$node_escaped|g" \
  -e "s|@ENV_FILE@|$env_escaped|g" \
  "$integration_root/systemd/aiir-feishu-codex.service" \
  >"$unit_dir/aiir-feishu-codex.service"
chmod 600 \
  "$unit_dir/aiir-codex-app-server.service" \
  "$unit_dir/aiir-feishu-codex.service"

systemctl --user daemon-reload
systemctl --user enable --now aiir-codex-app-server.service
systemctl --user enable --now aiir-feishu-codex.service

echo
echo "本机服务已经安装。"
echo "首次私聊机器人时发送："
echo "/aiir pair $pairing_code"
echo
echo "配对码只显示这一次，也保存在：$environment_file"
echo "完成配对后，让本机终端接入同一会话："
echo "bash $integration_root/scripts/connect.sh"
