# Backlog triển khai E-Warranty

Ngày cập nhật: 2026-03-22

## Trạng thái nền tảng

- [x] Web3 Smart Contract: 100%.
- [x] Thiết kế Database MongoDB Atlas: 100%.
- [x] BE đã có Model User.
- [x] BE đã có Model Product.

## Task tuần này - Backend (BE)

### UC-BE-APIContract (Ưu tiên cao nhất)

- [ ] Soạn API docs cho User và Product tại docs/api/user-product.md.
- [ ] Chốt chuẩn JSON response: success, message, data, error.
- [ ] Chốt danh sách mã lỗi (Error Codes) cho từng endpoint.
- [ ] Ghi testcase chuẩn để FE dùng mock data cùng cấu trúc.

### UC-BE-UserController

- [ ] Hoàn thiện controller cho POST /api/users/auth.
- [ ] Hoàn thiện controller cho GET /api/users/me.
- [ ] Hoàn thiện controller cho PUT /api/users/:walletAddress.
- [ ] Hoàn thiện controller cho GET /api/users.
- [ ] Cập nhật testcase bám sát API docs.

### UC-BE-ProductController

- [ ] Hoàn thiện controller cho POST /api/products.
- [ ] Hoàn thiện controller cho GET /api/products.
- [ ] Hoàn thiện controller cho GET /api/products/:idOrCode.
- [ ] Hoàn thiện controller cho PUT /api/products/:idOrCode.
- [ ] Hoàn thiện controller cho DELETE /api/products/:idOrCode.
- [ ] Cập nhật testcase bám sát API docs.

### UC-BE-IntegrationReady

- [ ] Cập nhật docs/api-status.md theo endpoint đã chạy thật.
- [ ] Đóng gói danh sách endpoint sẵn sàng bàn giao FE.

## Task tuần này - Frontend (FE)

### UC-FE-UIBase

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

- [ ] Có API Docs.
- [ ] Có Error Codes.
- [ ] Có logic Controller.
- [ ] Có Testcase cập nhật.

### Task FE chỉ được tick Done khi:

- [ ] Có UI hoàn chỉnh theo scope task.
- [ ] Có tích hợp nút Connect MetaMask.
- [ ] Có gọi API qua mock data từ docs của BE.
- [ ] Có phương án chuyển sang link API thật.
