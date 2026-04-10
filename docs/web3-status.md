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

### UC-MintNFT (Hybrid với Tự động IPFS)

- Luồng kỳ vọng mới (Đã cập nhật IPFS Auto-pin):
  1. Frontend gọi API `POST /api/warranties` để tạo nháp thẻ bảo hành.
  2. Backend tự động bọc dữ liệu, upload lên **Pinata IPFS** và nhận về `tokenURI`.
  3. Backend lưu vào MongoDB (`tokenURI`, `serialNumber`...) và trả `tokenURI` về cho Frontend.
  4. Frontend nhận `tokenURI`, kích hoạt MetaMask yêu cầu User ký xác nhận hàm `mint()` trên Smart Contract.
  5. Sau khi Smart Contract mint thành công (có `txHash`), Frontend gọi `PATCH /api/warranties/:id` xác nhận `tokenId` và `txHash`.
- Trạng thái: Backend Đã Hoàn Thành (FE Not Started)
- Checklist DoD:
  - [x] Backend kết nối thành công Pinata (Tự động IPFS).
  - [x] Backend endpoint `POST /warranties` trả về `tokenURI`.
  - [x] Backend endpoint `PATCH /warranties/:id` lưu `tokenId` chuẩn xác.
  - [ ] Frontend gọi MetaMask mint thành công bằng `tokenURI` từ BE trả về.
  - [ ] Frontend tích hợp chuỗi API Create -> MetaMask Mint -> Update API mượt mà.

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

- Backend **ĐÃ CÓ ĐẦY ĐỦ** Schema NFT Warranty Mapping (Tích hợp thêm `tokenURI` chuẩn ERC-721).
- Backend **ĐÃ HOÀN THIỆN** Endpoint đáp ứng luồng Mint Workflow (API Pre-mint tự sinh `tokenURI` trên Pinata và API Update Mint Data).
- FE chưa có kết nối thực tế với ví MetaMask.

## 4) Ưu tiên Web3 tuần này

- [ ] Chốt chuẩn dữ liệu on-chain: tokenId, walletAddress, serialHash.
- [ ] Khởi tạo repo/thu mục contract + script deploy Sepolia.
- [ ] Tạo UI Connect Wallet tối thiểu ở frontend.
- [ ] Thiết kế API backend phục vụ mint và truy vấn warranty.
- [ ] Khởi tạo indexer MVP ghi dữ liệu event vào MongoDB.
