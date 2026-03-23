# Huong dan chay du an (Devcontainer + local)

Ngay cap nhat: 2026-03-23

## 1) Nguyen tac quan ly dependency

- Khong cai package tai thu muc root.
- Moi phan co dependency rieng:
  - `backend/node_modules`
  - `frontend/node_modules`
- Moi phan co lockfile rieng:
  - `backend/package-lock.json`
  - `frontend/package-lock.json`

## 2) Neu dung VS Code Dev Container

1. Mo workspace trong container.
2. Script `.devcontainer/post-create.sh` se tu dong:
   - Chinh quyen cho `backend/node_modules`, `frontend/node_modules`, `/home/node/.npm`.
   - Xoa `node_modules` tai root neu co.
   - Cai dependency cho `backend` va `frontend` (uu tien `npm ci` neu co lockfile).

Neu da sua file trong `.devcontainer/`, hay chay:

- Command Palette -> `Dev Containers: Rebuild Container`

## 3) Chay backend

```bash
cd backend
npm run dev
```

Backend mac dinh: `http://localhost:5000`

## 4) Chay frontend

```bash
cd frontend
npm start
```

Frontend mac dinh: `http://localhost:3000`

## 5) Chay dong thoi

Mo 2 terminal:

- Terminal 1:

```bash
cd backend && npm run dev
```

- Terminal 2:

```bash
cd frontend && npm start
```

## 6) Kiem tra quyen thu muc node_modules

```bash
cd /workspaces/IE213
stat -c '%U:%G %a %n' backend/node_modules frontend/node_modules
```

Ky vong: owner la `node:node` va co the ghi duoc khi chay `npm install` trong tung thu muc.
