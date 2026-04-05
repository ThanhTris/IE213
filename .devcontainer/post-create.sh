#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="/workspaces/IE213"

# Ensure mounted volumes are writable by the non-root devcontainer user.
MOUNTED_PATHS=(
  "${WORKSPACE_ROOT}/backend/node_modules"
  "${WORKSPACE_ROOT}/frontend/node_modules"
  /home/node/.npm
)
sudo mkdir -p "${MOUNTED_PATHS[@]}"
sudo chown -R node:node "${MOUNTED_PATHS[@]}"

if [[ ! -f "${WORKSPACE_ROOT}/backend/package.json" ]]; then
  echo "[post-create] Missing backend/package.json"
  exit 1
fi

if [[ ! -f "${WORKSPACE_ROOT}/frontend/package.json" ]]; then
  echo "[post-create] Missing frontend/package.json"
  exit 1
fi

echo "[post-create] Installing backend dependencies"
cd "${WORKSPACE_ROOT}/backend"
npm install --no-audit --no-fund

echo "[post-create] Installing frontend dependencies"
cd "${WORKSPACE_ROOT}/frontend"
npm install --no-audit --no-fund

echo "[post-create] Done"
