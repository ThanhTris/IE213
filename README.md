# 🛡️ IE213 - Hệ thống Bảo Hành Điện Tử (E-Warranty) trên Blockchain

Dự án E-Warranty được thiết kế theo mô hình **Hybrid Web3**, kết hợp sức mạnh lưu trữ phi tập trung của Blockchain và hiệu năng tốc độ cao của Web2. Hệ thống sử dụng **React.js** cho Frontend, **Node.js + Express** cho Backend và **Smart Contract (ERC-721)** triển khai trên mạng **Sepolia Testnet**.

---

## 🏗️ Kiến Trúc Hệ Thống (Hybrid Web3 Architecture)

```mermaid
sequenceDiagram
    actor User as Admin (Trình duyệt)
    participant FE as Frontend (React.js)
    participant BE as Backend (Node.js/Express)
    participant DB as MongoDB
    participant IPFS as Pinata (IPFS)
    participant MetaMask
    participant SC as Smart Contract (Sepolia)

    User->>FE: 1. Nhập thông tin phiếu bảo hành & Upload Ảnh
    FE->>BE: 2. Gửi API (FormData) yêu cầu lưu nháp
    BE->>IPFS: 3. Tải Ảnh & Metadata JSON lên IPFS
    IPFS-->>BE: 4. Trả về tokenURI (ipfs://...)
    BE->>DB: 5. Lưu thông tin nháp vào CSDL
    BE-->>FE: 6. Trả kết quả kèm tokenURI
    FE->>MetaMask: 7. Yêu cầu ký giao dịch Mint NFT (Kèm tokenURI)
    MetaMask->>SC: 8. Gửi Tx đúc NFT lên Blockchain
    SC-->>FE: 9. Trả về Receipt (TxHash, TokenId)
    FE->>BE: 10. Gửi API cập nhật TxHash & TokenId
    BE->>DB: 11. Cập nhật trạng thái thành công
    BE-->>FE: 12. Hoàn tất quy trình
```

---

## 📂 Cấu Trúc Thư Mục

Dự án được chia thành các phân hệ độc lập (monorepo structure), mỗi thư mục chứa tài liệu `README.md` riêng để hướng dẫn chi tiết:

| Thư mục | Vai trò | Công nghệ sử dụng |
|---------|---------|-------------------|
| [`/backend`](./backend) | **API Server & Xử lý IPFS**: Đảm nhiệm lưu trữ dữ liệu tập trung, quản lý bảo mật và giao tiếp với Pinata IPFS. | Node.js, Express, MongoDB, Mongoose, Multer. |
| [`/frontend`](./frontend) | **Giao diện Người Dùng**: Quản lý Dashboard Admin, Web3 Integration và caching dữ liệu siêu tốc. | React, Vite, SWR, Ethers.js, Axios. |
| [`/contracts`](./contracts) | **Smart Contract**: Định nghĩa chuẩn ERC-721 cho Warranty NFT. | Solidity, Hardhat, OpenZeppelin. |
| [`/docs`](./docs) | **Tài liệu dự án**: Chứa các báo cáo BA, trạng thái API, tiến độ dự án. | Markdown, Mermaid. |
| [`/tests`](./tests) | **Kiểm thử tự động**: Kịch bản Unit Test và Integration Test. | Jest, Supertest. |

---

## 🚀 Hướng Dẫn Chạy Dự Án (Local Development)

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) >= 18.x
- [MongoDB](https://www.mongodb.com/) (Local hoặc Atlas)
- Ví **MetaMask** cài đặt trên trình duyệt (chuyển sang mạng Sepolia).

### 1. Clone Mã Nguồn
```bash
git clone https://github.com/ThanhTris/IE213.git
cd IE213
```

### 2. Cài Đặt Dependencies
```bash
# Cài đặt cho Backend
cd backend && npm install

# Cài đặt cho Frontend
cd ../frontend && npm install
```

### 3. Cấu Hình Biến Môi Trường (.env)
Bạn cần sao chép các file mẫu `.env.example` thành `.env` ở cả hai thư mục và điền các thông tin cần thiết:
```bash
# Cấu hình Backend
cd backend
cp .env.example .env

# Cấu hình Frontend
cd ../frontend
cp .env.example .env
```
*(Tham khảo `README.md` trong từng thư mục để biết ý nghĩa các biến).*

### 4. Khởi Động Server (Cùng lúc)
Khuyên dùng 2 cửa sổ Terminal để dễ theo dõi log:

```bash
# Terminal 1: Chạy Backend (Mặc định Port 5000)
cd backend
npm run dev

# Terminal 2: Chạy Frontend (Mặc định Port 5173)
cd frontend
npm run dev
```

---

## 🔒 Kiểm Thử Tính Năng Web3 (Bảo Hành NFT)

Mọi phiếu bảo hành đều là **NFT (Non-Fungible Token)**. Để đảm bảo tính xác thực, **chỉ có Admin (chủ sở hữu Smart Contract) mới có quyền tạo (Mint) phiếu bảo hành mới**. 

Để giáo viên hoặc người dùng khác có thể test, xin làm theo kịch bản sau:

### Kịch bản Test Chuyển Nhượng Bảo Hành
1. Người test tạo một địa chỉ ví MetaMask mới trên mạng **Sepolia**.
2. Gửi địa chỉ ví đó cho Admin hệ thống.
3. Admin đăng nhập vào Dashboard (sử dụng ví Admin), tiến hành **Tạo Phiếu Bảo Hành** và điền địa chỉ ví của người test vào ô "Ví Khách Hàng".
4. Sau khi quá trình tạo thành công (Mint hoàn tất), người test đăng nhập vào hệ thống bằng ví của mình sẽ thấy danh sách NFT Bảo hành đang sở hữu và có thể kiểm chứng trên Blockchain.

---

## 🛡️ Điểm Nhấn Kiến Trúc & Bảo Mật
- **Zero-trust Security**: Backend không lưu trữ hay nắm giữ Private Key của Admin. Giao dịch luôn được ký ở phía Client (MetaMask).
- **Backend-handled IPFS**: Quá trình upload dữ liệu (Ảnh, JSON Metadata) lên IPFS thông qua Pinata được đẩy về Backend xử lý nhằm bảo mật `PINATA_JWT`, chống lộ secret key qua Frontend.
- **SWR Caching**: Frontend áp dụng chiến lược Stale-While-Revalidate (SWR), loại bỏ hoàn toàn các request trùng lặp và mang lại tốc độ phản hồi tức thì khi chuyển trang trong Admin Workspace.

---
📝 **License:** MIT License
