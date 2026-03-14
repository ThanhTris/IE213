# IE213

Dự án web full-stack sử dụng React.js (Frontend) và Node.js + Express (Backend).

## Cấu Trúc Dự Án

```
IE213/
├── .devcontainer/      # Cấu hình môi trường phát triển (VS Code Dev Container)
├── backend/            # API Node.js + Express
│   ├── src/
│   │   ├── routes/     # Định nghĩa các route
│   │   ├── controllers/# Xử lý logic nghiệp vụ
│   │   ├── models/     # Mô hình dữ liệu
│   │   └── middleware/ # Middleware
│   ├── .env.example
│   └── package.json
├── frontend/           # Giao diện React.js
│   ├── public/
│   ├── src/
│   │   ├── components/ # Các component tái sử dụng
│   │   ├── pages/      # Các trang
│   │   └── assets/     # Hình ảnh, CSS, ...
│   └── package.json
├── docs/               # Tài liệu báo cáo, hướng dẫn sử dụng
├── tests/              # Các bài kiểm thử tự động
├── .gitignore
├── package.json
├── package-lock.json   # Lockfile duy nhất cho toàn bộ monorepo
└── README.md
```

## Yêu Cầu Hệ Thống

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x

## Quy Ước Quản Lý Dependency

- Dự án dùng `npm workspaces` cho `backend/` và `frontend/`.
- Chỉ dùng `package-lock.json` tại thư mục root.
- Không tạo hoặc commit `package-lock.json` riêng trong `backend/` và `frontend/`.

## Hướng Dẫn Cài Đặt

### 1. Clone repository

```bash
git clone https://github.com/ThanhTris/IE213.git
cd IE213
```

### 2. Cài đặt tất cả dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt dependencies cho cả backend và frontend.

### 3. Cấu hình biến môi trường

```bash
cp backend/.env.example backend/.env
```

Chỉnh sửa `backend/.env` theo nhu cầu.

## Hướng Dẫn Sử Dụng

### Chạy Backend (API Server)

```bash
npm run backend
# hoặc
npm run dev --workspace backend
```

Server sẽ chạy tại: http://localhost:5000

### Chạy Frontend (React App)

```bash
npm run frontend
# hoặc
npm run start --workspace frontend
```

Ứng dụng sẽ mở tại: http://localhost:3000

### Chạy cả Backend và Frontend cùng lúc

```bash
npm run dev
```

## Kiểm Thử

```bash
# Chạy tất cả tests
npm test

# Chỉ chạy backend tests
npm run test:backend

# Chỉ chạy frontend tests
npm run test:frontend
```

## Tài Liệu

Xem thêm tài liệu chi tiết trong thư mục [`docs/`](./docs/README.md).

## Đóng Góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/ten-tinh-nang`)
5. Tạo Pull Request

## Giấy Phép

MIT License
