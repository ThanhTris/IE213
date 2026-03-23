#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/IE213

# Cleanup any legacy root node_modules from previous devcontainer setup.
if [[ -d /workspaces/IE213/node_modules ]]; then
  rm -rf /workspaces/IE213/node_modules || true
fi

if [[ -f backend/package.json ]]; then
  echo "[post-create] Installing backend dependencies"
  cd backend
  npm install
  cd ..
fi

if [[ -f frontend/package.json ]]; then
  echo "[post-create] Installing frontend dependencies"
  cd frontend
  npm install
  cd ..
fi

echo "[post-create] Done"
