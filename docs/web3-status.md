# Trạng thái Smart Contract & Kết nối ví

Ngày cập nhật: 2026-03-22

## 1) Tổng quan

Mức hoàn thiện Smart Contract & Web3 hiện tại: 100% (phần On-chain)

Kết quả đối chiếu code:

- Smart Contract ERC-721 đã hoàn thành.
- Đã deploy lên Sepolia Testnet.
- Đã có Contract Address và ABI để tích hợp.

Theo trạng thái thực tế hiện tại: phần On-chain được ghi nhận hoàn thành.

## 2) Trạng thái theo Use Case Web3

### UC-WalletConnect (Frontend On-chain gateway)

- Luồng kỳ vọng:
  1. Frontend gọi MetaMask để xin quyền truy cập account.
  2. Nhận walletAddress, hiển thị trạng thái ví trên UI.
  3. Đồng bộ walletAddress xuống backend (UC-Auth).
- Trạng thái: Not Started
- Checklist DoD:
  - [ ] Có nút Connect Wallet hoạt động thật với MetaMask.
  - [ ] Xử lý accountChanged, chainChanged.
  - [ ] Chỉ chấp nhận Sepolia cho luồng nghiệp vụ.
  - [ ] Đồng bộ user vào MongoDB qua backend API.

### UC-DeployERC721 (On-chain)

- Luồng kỳ vọng:
  1. Viết contract ERC-721 cho bảo hành điện tử.
  2. Deploy lên Sepolia.
  3. Lưu địa chỉ contract và ABI vào cấu hình dự án.
- Trạng thái: Done
- Checklist DoD:
  - [x] Có contract ERC-721 trong repo.
  - [x] Có script deploy và log tx hash.
  - [x] Có contract address Sepolia trong tài liệu/cấu hình.
  - [x] Có test cơ bản cho mint/ownerOf/tokenURI hoặc serialHash mapping.

### UC-MintNFT (Hybrid)

- Luồng kỳ vọng:
  1. Frontend gọi hàm mint từ ví phù hợp.
  2. Contract phát event Mint/WarrantyIssued.
  3. Indexer đọc event và cập nhật MongoDB.
- Trạng thái: Not Started
- Checklist DoD:
  - [ ] Mint thành công trên Sepolia, có tx hash.
  - [ ] MongoDB lưu tokenId, walletAddress, serialHash tương ứng.
  - [ ] Backend có endpoint truy vấn mapping NFT <-> product/user.
  - [ ] Có test tích hợp end-to-end.

### UC-IndexerSync (Off-chain sync)

- Luồng kỳ vọng:
  1. Worker Ethers.js subscribe event contract.
  2. Parse event, transform dữ liệu.
  3. Upsert vào MongoDB, có cơ chế retry/re-org safety.
- Trạng thái: Not Started
- Checklist DoD:
  - [ ] Có module indexer riêng (job/worker/service).
  - [ ] Có lưu block xử lý cuối cùng.
  - [ ] Có cơ chế idempotent khi re-run.
  - [ ] Có monitor/log lỗi đồng bộ.

## 3) Đối chiếu Web3 với Backend hiện tại

- Chưa có kết nối thực tế giữa frontend và backend qua walletAddress.
- Chưa có endpoint backend phục vụ mint workflow hoặc đồng bộ dữ liệu on-chain.
- Chưa có schema MongoDB dành cho NFT warranty mapping.

## 4) Ưu tiên Web3 tuần này

- [ ] Chốt chuẩn dữ liệu on-chain: tokenId, walletAddress, serialHash.
- [ ] Khởi tạo repo/thu mục contract + script deploy Sepolia.
- [ ] Tạo UI Connect Wallet tối thiểu ở frontend.
- [ ] Thiết kế API backend phục vụ mint và truy vấn warranty.
- [ ] Khởi tạo indexer MVP ghi dữ liệu event vào MongoDB.
