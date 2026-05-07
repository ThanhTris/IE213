# 🧪 Kiểm Thử Tự Động (Tests)

Thư mục này chứa các kịch bản kiểm thử (Test Scripts) để đảm bảo độ tin cậy và sự ổn định cho dự án E-Warranty. Quá trình kiểm thử được phân tách rõ ràng giữa Backend và Frontend.

## 📂 Cấu trúc thư mục

```
tests/
├── backend/     # Kịch bản kiểm thử cho các REST API (dùng Vitest & Supertest)
│   ├── product/       # Test luồng quản lý Sản phẩm
│   ├── repair-log/    # Test luồng Ghi nhận bảo hành
│   └── warranty/      # Test luồng Đúc NFT và Chuyển nhượng
└── frontend/    # Kịch bản kiểm thử giao diện Frontend (nếu có)
```

## 🚀 Chạy Kiểm Thử

### 1. Kiểm Thử Backend (API & Business Logic)
Kiểm thử Backend sẽ giả lập một Cấu trúc CSDL trong bộ nhớ (In-memory DB) nhằm test các API mà không làm rác DB thật.
```bash
cd backend
npm run test
```

### 2. Kiểm Thử Frontend (UI & Component Logic)
*(Ghi chú: Cần cài đặt Vitest hoặc Jest trong thư mục Frontend)*
```bash
cd frontend
npm run test
```

## 🛡️ Tiêu chuẩn viết Test
- **Độc lập:** Mỗi bài test không được phụ thuộc vào dữ liệu của bài test trước đó.
- **Bao phủ (Coverage):** Đảm bảo test cả trường hợp Thành công (Happy Path) và Thất bại (Error Path - ví dụ: gửi sai định dạng ví, thiếu trường bắt buộc).
