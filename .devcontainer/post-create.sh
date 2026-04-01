#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/IE213

# Ensure mounted volumes are writable by the non-root devcontainer user.
MOUNTED_PATHS=(
  /workspaces/IE213/backend/node_modules
  /workspaces/IE213/frontend/node_modules
  /home/node/.npm
)
sudo mkdir -p "${MOUNTED_PATHS[@]}"
sudo chown -R node:node "${MOUNTED_PATHS[@]}"

install_deps() {
  local app_dir="$1"

  if [[ ! -f "${app_dir}/package.json" ]]; then
    echo "[post-create] Skip ${app_dir}: missing package.json"
    return
  fi

  echo "[post-create] Installing ${app_dir} dependencies"
  cd "/workspaces/IE213/${app_dir}"

  if [[ -f package-lock.json ]]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi

  cd /workspaces/IE213
}

install_deps backend
install_deps frontend

echo "[post-create] Done"
