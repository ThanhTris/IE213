# Báo cáo tiến độ dự án E-Warranty (Hybrid Blockchain)

Ngày cập nhật: 2026-03-22

## 1) Tóm tắt trạng thái tổng quan (thực tế)

- [x] Smart Contract (On-chain): hoàn thành 100% (đã viết ERC-721, deploy Sepolia, có Contract Address và ABI).
- [x] Database (Off-chain): hoàn thành 100% khâu thiết kế (5 bảng: User, Product, Warranties, RepairLog, TransferHistory).
- [ ] Backend API: đang triển khai.
- [ ] Frontend UI: bắt đầu triển khai trong tuần này.

## 2) Tiến độ theo mảng kỹ thuật

- Web3 (Smart Contract + kết nối chain): 100%
- Database (MongoDB Atlas schema): 100%
- Backend API: 30%
- Frontend UI: 10%

## 3) Chiến lược tuần này (FE và BE chạy song song)

- [x] BE định nghĩa API Contract và chuẩn JSON response trước.
- [x] BE lưu API Docs + testcase vào thư mục docs/api/.
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
- Trạng thái: In Progress
- Definition of Done:
  - [ ] Có API docs cho auth user.
  - [ ] Có mã lỗi chuẩn và response chuẩn hóa.
  - [ ] Controller xử lý đăng nhập/đăng ký theo walletAddress.
  - [ ] Testcase cập nhật theo API contract.

### UC-ProductCRUD (Off-chain)

- Luồng: FE gọi API Product -> BE validate và thao tác dữ liệu Product trong MongoDB.
- Trạng thái: In Progress
- Definition of Done:
  - [ ] Có API docs cho create/read/update/delete product.
  - [ ] Có mã lỗi chuẩn và response chuẩn hóa.
  - [ ] Controller xử lý đầy đủ CRUD.
  - [ ] Testcase cập nhật theo API contract.

### UC-FEFoundation (Frontend)

- Luồng: Dựng màn hình quản lý người dùng/sản phẩm -> gắn mock data từ docs/api -> chuyển sang API thật.
- Trạng thái: In Progress
- Definition of Done:
  - [ ] Dựng UI màn hình chính.
  - [ ] Có nút Connect MetaMask và trạng thái ví.
  - [ ] Tích hợp mock data theo API docs của BE.
  - [ ] Chuyển đổi sang API thật không đổi cấu trúc dữ liệu hiển thị.

## 5) Top 5 ưu tiên cao nhất tuần này

- [ ] Ưu tiên 1: Hoàn tất docs/api/user-product.md (request/response/error codes/testcase) để FE dùng ngay.
- [ ] Ưu tiên 2: Hoàn thiện controller + route cho User và Product dựa trên API contract đã chốt.
- [ ] Ưu tiên 3: FE dựng UI trang User/Product và bind mock data theo docs/api.
- [ ] Ưu tiên 4: FE tích hợp nút Connect MetaMask, hiển thị walletAddress và chain Sepolia.
- [ ] Ưu tiên 5: Đồng bộ checklist test BE/FE theo từng endpoint trước khi chuyển sang API thật.
