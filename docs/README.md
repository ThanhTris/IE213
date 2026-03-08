# Tài Liệu Dự Án IE213

## Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
4. [API Reference](#api-reference)

---

## Giới Thiệu

Dự án IE213 là một ứng dụng web full-stack sử dụng:
- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Cơ sở dữ liệu**: (cấu hình theo yêu cầu)

---

## Kiến Trúc Hệ Thống

```
IE213/
├── .devcontainer/     # Cấu hình môi trường phát triển
├── backend/           # API Node.js + Express
│   ├── src/
│   │   ├── routes/    # Định nghĩa các route
│   │   ├── controllers/ # Xử lý logic
│   │   ├── models/    # Mô hình dữ liệu
│   │   └── middleware/ # Middleware
│   └── package.json
├── frontend/          # Giao diện React.js
│   ├── public/
│   ├── src/
│   │   ├── components/ # Các component tái sử dụng
│   │   ├── pages/      # Các trang
│   │   └── assets/     # Hình ảnh, CSS
│   └── package.json
├── docs/              # Tài liệu
├── tests/             # Bài kiểm thử tự động
├── .gitignore
├── package.json
└── README.md
```

---

## Hướng Dẫn Sử Dụng

### Yêu Cầu Hệ Thống
- Node.js >= 18.x
- npm >= 9.x

### Cài Đặt
Xem [README.md](../README.md) để biết hướng dẫn cài đặt đầy đủ.

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Endpoints

| Method | Endpoint    | Mô tả         |
|--------|-------------|---------------|
| GET    | `/`         | Thông tin API |
| GET    | `/health`   | Kiểm tra sức khỏe server |
