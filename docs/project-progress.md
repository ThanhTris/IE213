# Báo cáo tiến độ dự án E-Warranty (Hybrid Blockchain)

Ngày cập nhật: 2026-03-30

## 1) Tóm tắt trạng thái tổng quan (thực tế)

- [x] Smart Contract (On-chain): hoàn thành 100% (đã viết ERC-721, deploy Sepolia, có Contract Address và ABI).
- [x] Database (Off-chain): hoàn thành 100% khâu thiết kế (5 bảng: User, Product, Warranties, RepairLog, TransferHistory).
- [x] Backend API: User/Product/Warranty/RepairLog/TransferHistory đã ổn định.
- [ ] Frontend UI: mới ở mức nền tảng.

## 2) Tiến độ theo mảng kỹ thuật

- Web3 (Smart Contract + kết nối chain): 100%
- Database (MongoDB Atlas schema): 100%
- Backend API: 96%
- Frontend UI: 15%

## 3) Chiến lược tuần này (FE và BE chạy song song)

- [x] BE định nghĩa API Contract và chuẩn JSON response trước.
- [x] BE lưu API Docs + testcase vào thư mục docs/api/.
- [x] BE đã có route/controller cho User và Product.
- [x] BE đã chuẩn hóa Product API theo contract mới nhất (soft delete, role check, message Việt hóa).
- [x] BE đã bổ sung và pass test backend cho Product API.
- [x] BE đã có route/controller Warranty cơ bản.
- [x] BE đã hoàn thiện Warranty API cho pre-mint/mint và admin management routes.
- [x] BE đã cập nhật API public verify theo hướng bảo mật: trả `ownerAddress` đã mask.
- [x] BE đã harden User API theo mô hình Zero Trust (tách self-update và admin-update).
- [x] BE đã mở rộng role hệ thống: `admin`, `staff`, `technician`, `user`.
- [x] BE đã tách API riêng cho role và isActive trong module User.
- [x] BE đã hoàn thiện module Repair Log: create/list/public-lookup/patch.
- [x] BE đã áp dụng rule Zero-Trust cho update Repair Log: admin sửa mọi log, technician chỉ sửa log của chính mình.
- [x] BE đã bổ sung và pass test backend cho Repair Log API.
- [ ] FE dùng tài liệu API để tạo mock data và dựng UI song song.
- [ ] FE thay mock bằng API thật ngay khi BE bàn giao endpoint.

## 4) Use Case chính và trạng thái

### UC-DeployERC721 (On-chain)

- Luồng: Viết contract ERC-721 -> Deploy Sepolia -> công bố Contract Address + ABI cho FE/BE.
- Trạng thái: Done
- Definition of Done:
  - [x] Có contract Solidity ERC-721.
  - [x] Deploy Sepolia thành công.
  - [x] Có Contract Address và ABI để tích hợp.

### UC-DBSchema (Off-chain)

- Luồng: Thiết kế schema MongoDB Atlas cho nghiệp vụ bảo hành.
- Trạng thái: Done
- Definition of Done:
  - [x] Chốt 5 bảng: User, Product, Warranties, RepairLog, TransferHistory.
  - [x] Đảm bảo quan hệ dữ liệu phục vụ trace lịch sử bảo hành.

### UC-AuthUser (Hybrid)

- Luồng: FE Connect MetaMask -> gửi walletAddress về BE -> BE lưu/đọc User trong MongoDB.
- Trạng thái: Done
- Definition of Done:
  - [x] Có API docs cho auth user.
  - [x] Có mã lỗi chuẩn và response chuẩn hóa.
  - [x] Controller xử lý đăng nhập/đăng ký theo walletAddress.
  - [x] Testcase cập nhật đầy đủ theo API contract.
  - [x] Chống leo thang đặc quyền ở luồng cập nhật profile.
  - [x] Tách API quản trị role/isActive theo nguyên tắc least privilege.

### UC-ProductCRUD (Off-chain)

- Luồng: FE gọi API Product -> BE validate và thao tác dữ liệu Product trong MongoDB.
- Trạng thái: Done
- Definition of Done:
  - [x] Có API docs cho create/read/update/delete product.
  - [x] Có mã lỗi chuẩn và response chuẩn hóa.
  - [x] Controller xử lý đầy đủ CRUD.
  - [x] Testcase cập nhật đầy đủ theo API contract.

### UC-WarrantyAPI (Hybrid)

- Luồng: BE nhận dữ liệu mint/sản phẩm bảo hành -> lưu Warranty -> truy vấn theo tokenId/ownerAddress.
- Trạng thái: Done
- Definition of Done:
  - [x] Có model Warranty và controller cơ bản.
  - [x] Có route create/get/update cho Warranty.
  - [x] Chuẩn hóa auth/role cho endpoint Warranty.
  - [x] Bổ sung luồng pre-mint/mint + admin management endpoints.
  - [x] Endpoint verify public đã che một phần `ownerAddress` để bảo vệ quyền riêng tư.
  - [x] Có testcase backend cho Warranty API.

### UC-RepairLogAPI (Off-chain)

- Luồng: Kỹ thuật viên/Admin tạo và cập nhật log sửa chữa -> hệ thống public tra cứu lịch sử theo serialNumber.
- Trạng thái: Done
- Definition of Done:
  - [x] Có model RepairLog theo schema thực tế (warrantyId, serialNumber, tokenId, technicianWallet, technicianName...).
  - [x] Có route/controller cho create, get all, get by serial (public), patch.
  - [x] Có phân quyền cập nhật theo ownership: admin toàn quyền, technician chỉ sửa log của mình.
  - [x] Có testcase backend cho các nhánh quyền và validate chính.

### UC-FEFoundation (Frontend)

- Luồng: Dựng màn hình quản lý người dùng/sản phẩm -> gắn mock data từ docs/api -> chuyển sang API thật.
- Trạng thái: In Progress
- Definition of Done:
  - [x] Dựng khung app React + trang Home.
  - [ ] Có nút Connect MetaMask và trạng thái ví.
  - [ ] Tích hợp mock data theo API docs của BE cho user/product.
  - [ ] Chuyển đổi sang API thật không đổi cấu trúc dữ liệu hiển thị.

## 5) Top 5 ưu tiên cao nhất tuần này

- [x] Ưu tiên 1: Hoàn tất docs/api/user-product.md (request/response/error codes/testcase) để FE dùng ngay.
- [x] Ưu tiên 2: Chuẩn hóa và gắn đầy đủ test cho Warranty.
- [ ] Ưu tiên 3: FE dựng UI trang User/Product và bind mock data theo docs/api.
- [ ] Ưu tiên 4: FE tích hợp nút Connect MetaMask, hiển thị walletAddress và chain Sepolia.
- [ ] Ưu tiên 5: Hoàn thiện TransferHistory API và chuẩn bị bàn giao FE phase kế tiếp.
