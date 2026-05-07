# ⚙️ E-Warranty Backend

Thư mục này chứa mã nguồn của API Server được xây dựng trên nền tảng **Node.js** và **Express**, sử dụng **MongoDB** làm cơ sở dữ liệu.

## 🌟 Chức năng chính
- Xử lý các nghiệp vụ (Business Logic) liên quan đến Sản phẩm, Phiếu bảo hành, Lịch sử sửa chữa và Người dùng.
- Tương tác với mạng IPFS thông qua **Pinata API** để tải lên Hình ảnh và dữ liệu Metadata của NFT một cách bảo mật.
- Xác thực và phân quyền (Authentication & Authorization) bằng **JSON Web Token (JWT)**, kết hợp địa chỉ ví EVM (Metamask).
- Cung cấp dữ liệu với hiệu năng cao cho ứng dụng Frontend.

## 📂 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/      # Khởi tạo kết nối (MongoDB)
│   ├── controllers/ # Xử lý Logic của các REST API
│   ├── middleware/  # Các lớp chặn/kiểm tra request (Auth, Multer upload)
│   ├── models/      # Định nghĩa cấu trúc dữ liệu MongoDB (Mongoose Schema)
│   ├── routes/      # Định tuyến các API Endpoint
│   ├── utils/       # Các hàm tiện ích (Pinata IPFS, API Response)
│   └── database/    # Chứa dữ liệu mẫu (JSON format)
├── .env.example     # File mẫu cấu hình môi trường
├── export-data.js   # Script trích xuất dữ liệu từ MongoDB ra file JSON
├── package.json     # Chứa danh sách thư viện (Dependencies)
└── src/index.js     # Điểm khởi chạy của Server
```

## 🚀 Khởi chạy Server

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
   Sau đó điền các thông số quan trọng như `MONGODB_URL`, `JWT_SECRET` và `PINATA_JWT`.

3. **Chạy ở chế độ phát triển (Dev Mode):**
   ```bash
   npm run dev
   ```
   Server sẽ tự động nạp lại (hot-reload) khi bạn sửa code, thường chạy tại `http://localhost:5000`.

## 🛡️ Ghi chú Bảo mật
- Tuyệt đối **KHÔNG** đưa file `.env` thực tế lên kho chứa mã nguồn (Git).
- Biến `JWT_SECRET` là bắt buộc phải được đặt khi triển khai (Production). Nếu thiếu, ứng dụng sẽ báo lỗi `FATAL ERROR` và không khởi động nhằm ngăn chặn rủi ro lộ secret mặc định.
