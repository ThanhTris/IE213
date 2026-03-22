# Trạng thái API Backend

Ngày cập nhật: 2026-03-22

## 1) Tổng quan

Mức hoàn thiện API backend hiện tại: 20%

Backend đang có:

- App Express, middleware CORS/Morgan/JSON parser.
- Chuẩn hóa response thành công/lỗi.
- Route prefix /api.
- Endpoint hoạt động thực tế: GET /api/health.

Backend chưa có triển khai thực tế:

- User API (auth/profile/update/list).
- Product API (CRUD).
- Repair Log API.
- Warranty/NFT mapping API.

## 2) Bảng trạng thái endpoint

| Endpoint                       | Trạng thái  | RESTful        | Ghi chú                                                 |
| ------------------------------ | ----------- | -------------- | ------------------------------------------------------- |
| GET /api/health                | Done        | Đúng           | Có controller + test health                             |
| GET /api                       | Done (404)  | Chấp nhận được | Không có resource root, trả Route not found             |
| POST /api/users/auth           | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| GET /api/users/me              | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| PUT /api/users/:walletAddress  | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| GET /api/users                 | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| POST /api/products             | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| GET /api/products              | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| GET /api/products/:idOrCode    | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| PUT /api/products/:idOrCode    | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |
| DELETE /api/products/:idOrCode | Not Started | Chưa đánh giá  | Có trong test kỳ vọng, chưa có route/controller thực tế |

## 3) Đánh giá RESTful sơ bộ

- Phần đã triển khai:
  - GET /api/health rõ ràng, đúng mục đích healthcheck.
- Phần kỳ vọng theo test (chưa triển khai):
  - Nhóm users và products đang đặt tên endpoint theo chuẩn tài nguyên, nhìn chung RESTful.
  - Cần chuẩn hóa tiếp: quy tắc soft-delete/hard-delete bằng query hard=true nên có tài liệu rõ và thống nhất.

## 4) Checklist để chuyển trạng thái Done

### UC-Auth API

- [ ] Tạo UserModel với unique walletAddress.
- [ ] Tạo route/controller POST /api/users/auth.
- [ ] Tạo route/controller GET /api/users/me.
- [ ] Tạo route/controller PUT /api/users/:walletAddress.
- [ ] Tạo route/controller GET /api/users.
- [ ] Kết nối MongoDB thật và pass test backend.

### UC-ProductCRUD API

- [ ] Tạo ProductModel với unique productCode.
- [ ] Tạo route/controller POST /api/products.
- [ ] Tạo route/controller GET /api/products.
- [ ] Tạo route/controller GET /api/products/:idOrCode.
- [ ] Tạo route/controller PUT /api/products/:idOrCode.
- [ ] Tạo route/controller DELETE /api/products/:idOrCode (soft/hard delete).
- [ ] Kết nối MongoDB thật và pass test backend.

### UC-RepairLog API

- [ ] Thiết kế schema repair log liên kết tokenId/serial/productCode.
- [ ] Tạo API create/read/update repair logs.
- [ ] Chuẩn hóa phân quyền kỹ thuật viên/quản trị.
- [ ] Có đối soát với dữ liệu NFT bảo hành (nếu yêu cầu).
