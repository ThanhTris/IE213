# IE213

Dự án E-Warranty theo mô hình Hybrid Blockchain, sử dụng React.js (Frontend), Node.js + Express (Backend) và smart contract ERC-721 trên Sepolia.

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
└── README.md
```

## Yêu Cầu Hệ Thống

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x

## Quy Ước Quản Lý Dependency

- Mỗi phần chạy độc lập tại thư mục riêng:
  - `backend/` có `package.json`, `package-lock.json`, `node_modules` riêng.
  - `frontend/` có `package.json`, `package-lock.json`, `node_modules` riêng.
- Không cài dependency tại thư mục root.

## Hướng Dẫn Cài Đặt

### 1. Clone repository

```bash
git clone https://github.com/ThanhTris/IE213.git
cd IE213
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

### 4. Cấu hình biến môi trường

```bash
cd /workspaces/IE213
cp backend/.env.example backend/.env
```

Chỉnh sửa `backend/.env` theo nhu cầu.

## Hướng Dẫn Sử Dụng

### Chạy Backend (API Server)

```bash
cd backend
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

### Chạy Frontend (React App)

```bash
cd frontend
npm start
```

Ứng dụng sẽ mở tại: http://localhost:3000

### Chạy cả Backend và Frontend cùng lúc

Mở 2 terminal riêng:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## 🧪 Hướng Dẫn Test Tính Năng Blockchain (Web3)

Vì dự án sử dụng Blockchain, quyền sở hữu bảo hành gắn liền với **Private Key (Khóa riêng tư)** trên MetaMask. Do cơ chế bảo mật của Smart Contract, **chỉ có Admin (người triển khai hợp đồng) mới được quyền Tạo (Mint) phiếu bảo hành**.

Để người dùng (hoặc giáo viên chấm bài) có thể test tính năng **Chuyển nhượng bảo hành**, cần thực hiện 1 trong 2 cách sau:

### Cách 1: Sử dụng Ví Test dùng chung (Khuyên dùng cho Demo)
Admin có thể chuẩn bị sẵn các ví chứa NFT và cung cấp Private Key để người test tự đăng nhập:
1. Mở MetaMask, chọn **Import Account** (Nhập tài khoản).
2. Dán Private Key của Ví Test: *(Admin cập nhật Private Key vào đây trước khi public)*
3. Đảm bảo MetaMask đang ở mạng **Sepolia Testnet**.
4. Đăng nhập vào hệ thống bằng ví vừa nhập. Lúc này bạn sẽ thấy các phiếu bảo hành đã được đúc sẵn và có thể chuyển nhượng chúng.

### Cách 2: Yêu cầu Admin phát (Airdrop) phiếu bảo hành
1. Người test tạo ví MetaMask mới và chuyển sang mạng **Sepolia**.
2. Gửi địa chỉ ví (Address) cho Admin.
3. Admin sẽ đăng nhập bằng ví Admin, vào mục **Tạo phiếu bảo hành**, điền thông tin và paste địa chỉ ví của người test vào ô "Địa chỉ ví khách hàng".
4. Sau khi Admin tạo xong, người test đăng nhập vào web sẽ thấy phiếu bảo hành của mình và có thể toàn quyền sử dụng/chuyển nhượng.

## Kiểm Thử

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

## Tài Liệu

Xem thêm tài liệu chi tiết trong thư mục `docs/`, đặc biệt `docs/dev-setup.md`, `docs/project-progress.md`, `docs/api-status.md`, `docs/web3-status.md`.

## Đóng Góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/ten-tinh-nang`)
5. Tạo Pull Request

## Giấy Phép

MIT License
