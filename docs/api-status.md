# Trạng thái API Backend

Ngày cập nhật: 2026-03-24

## 1) Tổng quan

Mức hoàn thiện API backend hiện tại: 80%

Backend đang có:

- App Express, middleware CORS/Morgan/JSON parser.
- Chuẩn hóa response thành công/lỗi.
- Route prefix /api.
- Endpoint hoạt động thực tế: GET /api/health.
- User API: đã có route/controller + JWT auth + role cơ bản.
- Product API: đã có CRUD route/controller.
- Warranty API: đã có route/controller cơ bản.

Backend chưa có triển khai thực tế:

- Repair Log API chưa sẵn sàng chạy do chưa được wire vào app và không đồng bộ tên file/module.
- Chưa có bộ test đầy đủ cho Warranty API.

## 2) Bảng trạng thái endpoint

| Endpoint                                | Trạng thái  | RESTful        | Ghi chú                                                                   |
| --------------------------------------- | ----------- | -------------- | ------------------------------------------------------------------------- |
| GET /api/health                         | Done        | Đúng           | Có controller + test health                                               |
| GET /api                                | Done (404)  | Chấp nhận được | Không có resource root, trả Route not found                               |
| POST /api/users/auth                    | Done        | Đúng           | Đã triển khai login/register theo wallet                                  |
| GET /api/users/me                       | Done        | Chấp nhận được | Có auth, dùng walletAddress query/body                                    |
| PUT /api/users/:walletAddress           | Done        | Đúng           | Có auth + kiểm tra quyền user/admin                                       |
| GET /api/users                          | Done        | Đúng           | Chỉ admin truy cập                                                        |
| POST /api/products                      | Done        | Đúng           | Có auth + authorize admin, response tạo mới chỉ trả createdAt             |
| GET /api/products                       | Done        | Đúng           | Public list mặc định active-only, includeInactive chỉ cho admin           |
| GET /api/products/:idOrCode             | Done        | Đúng           | Hỗ trợ id hoặc productCode                                                |
| PUT /api/products/:idOrCode             | Done        | Đúng           | Có auth + authorize admin                                                 |
| DELETE /api/products/:idOrCode          | Done        | Đúng           | Soft delete (isActive=false), không còn hard delete qua query             |
| POST /api/warranties                    | In Progress | Đúng           | Đã có controller, chưa gắn auth/role                                      |
| GET /api/warranties/:tokenId            | In Progress | Đúng           | Đã có controller cơ bản                                                   |
| GET /api/warranties/owner/:ownerAddress | In Progress | Đúng           | Đã có controller cơ bản                                                   |
| GET /api/warranties                     | In Progress | Chấp nhận được | Chưa giới hạn admin                                                       |
| PUT /api/warranties/:tokenId            | In Progress | Đúng           | Đã có update cơ bản                                                       |
| /api/repair-logs/\*                     | Blocked     | Chưa đánh giá  | File route/controller hiện chưa đồng bộ import path và chưa mount vào app |

## 3) Đánh giá RESTful sơ bộ

- Phần đã triển khai:
  - Nhóm users và products theo chuẩn tài nguyên, nhìn chung RESTful.
  - Warranty API đã có tài nguyên rõ nhưng thiếu auth/role.
- Phần cần chuẩn hóa tiếp:
  - Đồng bộ chuẩn response ở Warranty/RepairLog về cùng helper sendSuccess/sendError.
  - Hoàn thiện và mount Repair Log route vào app sau khi đồng bộ tên file/module.

## 4) Checklist để chuyển trạng thái Done

### UC-Auth API

- [x] Tạo UserModel với unique walletAddress.
- [x] Tạo route/controller POST /api/users/auth.
- [x] Tạo route/controller GET /api/users/me.
- [x] Tạo route/controller PUT /api/users/:walletAddress.
- [x] Tạo route/controller GET /api/users.
- [ ] Pass đầy đủ test backend cho luồng auth/user.

### UC-ProductCRUD API

- [x] Tạo ProductModel với unique productCode.
- [x] Tạo route/controller POST /api/products.
- [x] Tạo route/controller GET /api/products.
- [x] Tạo route/controller GET /api/products/:idOrCode.
- [x] Tạo route/controller PUT /api/products/:idOrCode.
- [x] Tạo route/controller DELETE /api/products/:idOrCode (soft delete).
- [x] Pass đầy đủ test backend cho product CRUD.

### UC-RepairLog API

- [ ] Đồng bộ tên file/controller/middleware theo cấu trúc hiện tại.
- [ ] Mount route repair log vào app.
- [ ] Chuẩn hóa phân quyền kỹ thuật viên/quản trị.
- [ ] Viết test cho create/read/update/delete repair logs.

### UC-Warranty API

- [x] Tạo model Warranty.
- [x] Tạo route/controller create/get/update warranty.
- [ ] Bổ sung auth/role cho endpoint warranty.
- [ ] Viết test cho warranty API.
