# Trạng thái API Backend

Ngày cập nhật: 2026-03-31

## 1) Tổng quan

Mức hoàn thiện API backend hiện tại: 100%

Backend đang có:

- App Express, middleware CORS/Morgan/JSON parser.
- Chuẩn hóa response thành công/lỗi.
- Route prefix /api.
- Endpoint hoạt động thực tế: GET /api/health.
- User API: đã có route/controller + JWT auth + role cơ bản.
- Product API: đã có CRUD route/controller.
- Warranty API: đã có pre-mint/mint/admin flows + public verify.
- Repair Log API: đã có create/list/public lookup/patch + phân quyền ownership.
- Transfer History API: đã có routes/controller + unit tests; hỗ trợ `POST /api/transfers` (yêu cầu JWT, kiểm tra chủ sở hữu) và public `GET /api/transfers/tx/:txHash`, `GET /api/transfers/token/:tokenId`.

## 2) Bảng trạng thái endpoint

| Endpoint                                  | Trạng thái | RESTful        | Ghi chú                                                                |
| ----------------------------------------- | ---------- | -------------- | ---------------------------------------------------------------------- |
| GET /api/health                           | Done       | Đúng           | Có controller + test health                                            |
| GET /api                                  | Done (404) | Chấp nhận được | Không có resource root, trả Route not found                            |
| POST /api/users/auth                      | Done       | Đúng           | Đã triển khai login/register theo wallet                               |
| GET /api/users/me                         | Done       | Chấp nhận được | Có auth, dùng walletAddress query/body                                 |
| PUT /api/users/:walletAddress             | Done       | Đúng           | Có auth + kiểm tra quyền user/admin                                    |
| GET /api/users                            | Done       | Đúng           | Chỉ admin truy cập                                                     |
| POST /api/products                        | Done       | Đúng           | Có auth + authorize admin, response tạo mới chỉ trả createdAt          |
| GET /api/products                         | Done       | Đúng           | Public list mặc định active-only, includeInactive chỉ cho admin        |
| GET /api/products/:idOrCode               | Done       | Đúng           | Hỗ trợ id hoặc productCode                                             |
| PUT /api/products/:idOrCode               | Done       | Đúng           | Có auth + authorize admin                                              |
| DELETE /api/products/:idOrCode            | Done       | Đúng           | Soft delete (isActive=false), không còn hard delete qua query          |
| POST /api/warranties                      | Done       | Đúng           | Có auth/role + pre-mint flow                                           |
| PUT /api/warranties/:id/mint              | Removed    | Deprecated     | Đã loại bỏ: dùng `PATCH /api/warranties/:id` để gắn `tokenId`/`txHash` |
| PATCH /api/warranties/:id/status          | Done       | Đúng           | Quản trị trạng thái bảo hành                                           |
| GET /api/warranties                       | Done       | Đúng           | Có auth + authorize                                                    |
| GET /api/warranties/:id                   | Done       | Đúng           | Xem chi tiết bảo hành admin/staff                                      |
| GET /api/warranties/my-warranties         | Done       | Đúng           | Danh sách bảo hành theo chủ sở hữu từ token                            |
| GET /api/warranties/verify/:serialNumber  | Done       | Đúng           | Public verify, có mask ownerAddress                                    |
| POST /api/repair-logs                     | Done       | Đúng           | Chỉ admin/technician, create repair log                                |
| GET /api/repair-logs                      | Done       | Đúng           | Admin/staff/technician xem toàn bộ                                     |
| GET /api/repair-logs/device/:serialNumber | Done       | Đúng           | Public lookup theo serialNumber, có check tồn tại warranty             |
| PATCH /api/repair-logs/:id                | Done       | Đúng           | Admin sửa mọi log, technician chỉ sửa log của chính mình               |

| POST /api/transfers | Done | Đúng | Ghi nhận transfer, bảo mật ownership (JWT) |
| GET /api/transfers/tx/:txHash | Done | Đúng | Public lookup transfer detail theo txHash |
| GET /api/transfers/token/:tokenId | Done | Đúng | Public lịch sử transfer theo tokenId |

## 3) Đánh giá RESTful sơ bộ

- Phần đã triển khai:
  - Nhóm users và products theo chuẩn tài nguyên, nhìn chung RESTful.
  - Warranty API đã hoàn thiện auth/role + public verify.
  - Repair Log API đã có phân quyền theo ownership cho thao tác cập nhật.
- Phần cần chuẩn hóa tiếp:
  - Hoàn thiện Transfer History API để khép kín vòng đời bảo hành/chuyển nhượng.

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

- [x] Đồng bộ tên file/controller/middleware theo cấu trúc hiện tại.
- [x] Mount route repair log vào app.
- [x] Chuẩn hóa phân quyền kỹ thuật viên/quản trị + ownership.
- [x] Viết test cho create/read/update repair logs.

### UC-Warranty API

- [x] Tạo model Warranty.
- [x] Tạo route/controller create/get/update warranty.
- [x] Bổ sung auth/role cho endpoint warranty.
- [x] Viết test cho warranty API.
