# Backlog triển khai E-Warranty

Ngày cập nhật: 2026-03-29

## Trạng thái nền tảng

- [x] Web3 Smart Contract: 100%.
- [x] Thiết kế Database MongoDB Atlas: 100%.
- [x] BE đã có Model User.
- [x] BE đã có Model Product.
- [x] BE đã có Model Warranty.

## Task tuần này - Backend (BE)

### UC-BE-APIContract (Ưu tiên cao nhất)

- [x] Soạn API docs cho User và Product tại docs/api/user-product.md.
- [x] Chốt chuẩn JSON response: success, message, data, error.
- [x] Chốt danh sách mã lỗi (Error Codes) cho từng endpoint.
- [x] Ghi testcase chuẩn để FE dùng mock data cùng cấu trúc.

### UC-BE-UserController

- [x] Hoàn thiện controller cho POST /api/users/auth.
- [x] Hoàn thiện controller cho GET /api/users/me.
- [x] Hoàn thiện controller cho PUT /api/users/:walletAddress.
- [x] Hoàn thiện controller cho GET /api/users.
- [x] Cập nhật testcase bám sát API docs.
- [x] Tách luồng cập nhật profile cá nhân (`PUT /api/users/me`) và luồng quản trị (`PUT /api/users/:walletAddress`).
- [x] Chuẩn hóa role enum: `admin`, `staff`, `technician`, `user`.
- [x] Bổ sung API quản trị role riêng: `PATCH /api/users/:walletAddress/role` (admin only).
- [x] Bổ sung API trạng thái hoạt động riêng: `PATCH /api/users/:walletAddress/is-active`.
- [x] Khóa leo thang đặc quyền: endpoint user tự cập nhật không cho đổi `role`/`isActive`.

### UC-BE-ProductController

- [x] Hoàn thiện controller cho POST /api/products.
- [x] Hoàn thiện controller cho GET /api/products.
- [x] Hoàn thiện controller cho GET /api/products/:idOrCode.
- [x] Hoàn thiện controller cho PUT /api/products/:idOrCode.
- [x] Hoàn thiện controller cho DELETE /api/products/:idOrCode.
- [x] Cập nhật testcase bám sát API docs.
- [x] Việt hóa message response cho Product API.
- [x] Chuẩn hóa response tạo mới: chỉ trả createdAt, không trả updatedAt.

### UC-BE-WarrantyController

- [x] Hoàn thiện controller cơ bản cho POST/GET/PUT warranty.
- [x] Gắn route `/api/warranties` trong app.
- [x] Bổ sung auth + phân quyền cho warranty endpoints.
- [ ] Viết test backend cho warranty endpoints.

### UC-BE-RepairLog

- [ ] Đồng bộ tên file/model/controller/middleware theo cấu trúc hiện tại.
- [ ] Gắn route repair log vào app.
- [ ] Viết test backend cho repair log.

### UC-BE-IntegrationReady

- [x] Cập nhật docs/api-status.md theo endpoint đã chạy thật.
- [x] Hoàn tất test backend cho Product API (13 test case pass).
- [ ] Đóng gói danh sách endpoint sẵn sàng bàn giao FE.

## Task tuần này - Frontend (FE)

### UC-FE-UIBase

- [x] Dựng khung App + trang Home.
- [ ] Dựng UI trang User (profile/basic info).
- [ ] Dựng UI trang Product (list/detail/form).
- [ ] Dùng mock data theo đúng docs/api/user-product.md.

### UC-FE-Web3Connect

- [ ] Tạo nút Connect MetaMask.
- [ ] Hiển thị walletAddress đã kết nối.
- [ ] Xử lý đổi account/chain cơ bản cho Sepolia.

### UC-FE-APIIntegration

- [ ] Viết service layer theo API Contract (chưa gọi API thật).
- [ ] Bọc toàn bộ call bằng adapter để dễ đổi từ mock -> endpoint thật.
- [ ] Sau khi BE bàn giao, thay baseURL và bật gọi API thật.

### UC-FE-Review

- [ ] Đối chiếu payload thực tế với docs/api/user-product.md.
- [ ] Log mismatch và gửi lại BE cập nhật contract nếu cần.

## Definition of Done bắt buộc

### Task BE chỉ được tick Done khi:

- [x] Có API Docs.
- [x] Có Error Codes.
- [x] Có logic Controller (User/Product).
- [x] Có Testcase cập nhật (User/Product).

### Task FE chỉ được tick Done khi:

- [ ] Có UI hoàn chỉnh theo scope task.
- [ ] Có tích hợp nút Connect MetaMask.
- [ ] Có gọi API qua mock data từ docs của BE.
- [ ] Có phương án chuyển sang link API thật.
