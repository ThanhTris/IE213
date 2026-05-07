# 🎨 E-Warranty Frontend

Thư mục này chứa mã nguồn giao diện người dùng (User Interface) của ứng dụng, được xây dựng bằng **React.js** và đóng gói bởi siêu công cụ **Vite**.

## 🌟 Chức năng chính
- Tích hợp công nghệ **Web3** (thông qua `ethers.js`) cho phép kết nối với ví **MetaMask** và gọi các hàm tương tác với Smart Contract (như đúc NFT, chuyển nhượng).
- Giao diện Admin chuyên nghiệp để quản lý sản phẩm, tài khoản, cấp phát bảo hành và cập nhật nhật ký sửa chữa.
- Ứng dụng kiến trúc lấy dữ liệu (Data Fetching) hiện đại bằng **SWR (Stale-While-Revalidate)**, giúp các trang load dữ liệu siêu tốc, loại bỏ thời gian chờ và số lần gọi API thừa.

## 📂 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── assets/       # Tài nguyên tĩnh (Hình ảnh, CSS Stylesheets)
│   ├── components/   # Các khối giao diện nhỏ, có thể tái sử dụng (Button, Header, Modal)
│   ├── contracts/    # Chứa file cấu hình ABI để giao tiếp với Smart Contract
│   ├── hooks/        # Chứa SWR Hooks phục vụ lưu đệm dữ liệu (useAdminData, useWarranties)
│   ├── pages/        # Các trang màn hình chính (Dashboard, Trang chủ, Workspace)
│   ├── services/     # Tệp tin đảm nhiệm gọi API Backend bằng thư viện Axios
│   ├── utils/        # Hàm xử lý Web3, rút gọn chuỗi, tính toán thời gian
│   └── App.jsx       # Component điều hướng (React Router) trung tâm
├── .env.example      # File mẫu cấu hình các biến môi trường
├── vite.config.js    # Cấu hình đóng gói dự án của Vite
└── package.json      # Danh sách thư viện (Dependencies)
```

## 🚀 Khởi chạy Giao Diện

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
   Bạn cần điều chỉnh `VITE_API_BASE_URL` trỏ về địa chỉ server Backend của bạn, và nhập `VITE_CONTRACT_ADDRESS` nếu triển khai hợp đồng trên mạng mới.

3. **Chạy ở chế độ phát triển (Dev Mode):**
   ```bash
   npm run dev
   ```
   Trang web thường sẽ khởi chạy tại `http://localhost:5173`.

## 🛡️ Tối ưu hóa & Lưu ý
- Quá trình đúc NFT (Minting) diễn ra theo chuẩn Hybrid: Frontend sẽ gửi toàn bộ Dữ liệu + Ảnh sang Backend để Backend "thay mặt" đẩy lên IPFS một cách an toàn. Sau khi có `tokenURI`, Frontend mới kích hoạt MetaMask để ký giao dịch đúc NFT trên chuỗi khối (Blockchain). 
- Các biến môi trường trong file `.env` chứa tiền tố `VITE_` sẽ được công khai (bundle) vào mã Javascript ở phía client. **Tuyệt đối không** đưa private key hay secret token vào file này!
