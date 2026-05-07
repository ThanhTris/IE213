# 📜 E-Warranty Smart Contracts

Thư mục này chứa mã nguồn của các Hợp đồng Thông minh (Smart Contract) điều hành toàn bộ quy trình sở hữu và chuyển nhượng Phiếu Bảo Hành (dưới dạng NFT) trên môi trường chuỗi khối (Blockchain). 

## 🌟 Thông tin kỹ thuật
- **Ngôn ngữ:** Solidity (^0.8.20)
- **Chuẩn Token:** ERC-721 (Non-Fungible Token)
- **Thư viện nền tảng:** OpenZeppelin (đảm bảo bảo mật và cấu trúc chuẩn cho ERC-721).
- **Mạng triển khai:** Sepolia Testnet (Mạng thử nghiệm của Ethereum).

## 📂 Cấu trúc thư mục

```
contracts/
├── EWarranty.sol        # Mã nguồn Smart Contract chính
└── WarrantyNFT.json     # Tệp Application Binary Interface (ABI) được ứng dụng React sử dụng để gọi hàm hợp đồng
```

## 🛠️ Các Hàm (Functions) cốt lõi

### 1. Hàm tạo bảo hành: `mintWarranty`
*(Chỉ dành cho Admin / Người triển khai hợp đồng)*
- **Chức năng:** Tạo (đúc) một phiếu bảo hành NFT mới đại diện cho một sản phẩm và gắn nó vào địa chỉ ví của khách hàng.
- **Tham số (Inputs):**
  - `to`: Địa chỉ ví khách hàng.
  - `tokenURI`: Đường dẫn liên kết đến dữ liệu IPFS chứa ảnh và thông tin sản phẩm (Pinata).
  - `serialHash`: Đoạn mã băm (Hash) của số Serial sản phẩm để ngăn chặn việc đúc trùng.
  - `expiryTimestamp`: Dấu thời gian (Unix Timestamp) đánh dấu ngày hết hạn bảo hành.

### 2. Hàm chuyển nhượng: Dùng các hàm chuẩn ERC-721
- Khách hàng (người nắm giữ NFT) có toàn quyền chuyển nhượng thẻ bảo hành (bán lại hoặc tặng thiết bị cũ) bằng việc gọi các hàm tích hợp sẵn như `transferFrom` hoặc `safeTransferFrom`. Quyền lợi bảo hành sẽ tự động dịch chuyển theo thiết bị đến người chủ mới.

## 🛡️ Thiết kế Bảo mật Hợp đồng
- **Chống làm giả:** Hàm đúc (`mintWarranty`) được đặt `onlyOwner`, nghĩa là dù cho hợp đồng có công khai thì cũng chỉ có cửa hàng (Admin) mới có quyền phát hành bảo hành chính hãng.
- **Tính duy nhất:** Sử dụng biến ánh xạ `serialHashes` để theo dõi. Nếu hệ thống thử đúc NFT cho một `serialHash` đã tồn tại, giao dịch trên Blockchain sẽ tự động bị từ chối (Revert).
