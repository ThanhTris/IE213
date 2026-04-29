# IE213 - Hệ thống Quản lý Bảo hành Điện tử (E-Warranty)

Dự án môn học Phát triển ứng dụng Web hiện đại (IE213) - Trường Đại học Công nghệ Thông tin, ĐHQG-HCM.

---

## 🏛 Thông tin chung
- **Trường**: Đại học Công nghệ Thông tin, ĐHQG-HCM
- **Khoa**: Khoa học và Kỹ thuật Thông tin (KH&KTTT)
- **Giảng viên hướng dẫn**: ThS. Võ Tấn Khoa
- **Nhóm sinh viên thực hiện**:
  1. 23521645 Nguyễn Thanh Trí
  2. 23521627 Lê Thị Thùy Trang
  3. 21522033 Lê Trung Hải
  4. 21522484 Đoàn Thị Tuyết Phương

---

## 🚀 Demo & Tra cứu
- **Link Website (Render)**: [https://e-warranty-frontend.onrender.com/](https://e-warranty-frontend.onrender.com/)
- **Video Demo (YouTube)**: [https://youtu.be/kVsBl7AasHs](https://youtu.be/kVsBl7AasHs)

### 🔍 Dữ liệu mẫu để tra cứu (Serial Number):
Bạn có thể sử dụng các mã Serial sau để trải nghiệm tính năng tra cứu công khai:
- `W01-APL-IP15PM-001`
- `W02-APL-IP15-002`
- `W03-APL-IP14P-003`
- `W07-OPP-R10P-007`

### ⚠️ Lưu ý về tính năng Web3:
- **Quyền tạo bảo hành (Mint)**: Do Smart Contract đã được deploy trên mạng Sepolia có cấu hình bảo mật, quyền `mintWarranty` chỉ dành riêng cho địa chỉ **Admin**. Vì vậy, người dùng thông thường sẽ không thể tạo mới phiếu bảo hành trên giao diện web.
- **Thử nghiệm chuyển nhượng**: Nếu bạn muốn trải nghiệm tính năng chuyển nhượng NFT bảo hành giữa các ví, vui lòng liên hệ với chúng tôi qua email **23521645@gm.uit.edu.vn** để được cấp phát phiếu thử nghiệm.
- Các quy trình đúc NFT và chuyển nhượng đã được thực hiện và kiểm chứng thành công trong video demo.

---

## 🛠 Công nghệ sử dụng
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Frontend**: [React.js](https://reactjs.org/) (Vite), [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Blockchain**: [Solidity](https://soliditylang.org/), [Sepolia Testnet](https://sepolia.etherscan.io/), [MetaMask](https://metamask.io/)
- **Storage (IPFS)**: [Pinata](https://www.pinata.cloud/)

---

## 🏗 Kiến trúc hệ thống
Hệ thống bao gồm các vai trò chính:
1. **Admin**: Quản lý sản phẩm, nhân viên và cấu hình hệ thống.
2. **Staff (Nhân viên)**: Tạo phiếu bảo hành (Mint NFT), kiểm tra thông tin khách hàng.
3. **Technician (Kỹ thuật viên)**: Cập nhật nhật ký sửa chữa (Repair Log) cho các thiết bị đang bảo hành.
4. **User (Khách hàng)**: Tra cứu bảo hành, quản lý danh sách thiết bị sở hữu, thực hiện chuyển nhượng bảo hành (Transfer NFT).

---

## 💻 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (v18 trở lên)
- MongoDB
- MetaMask Extension

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/ThanhTris/IE213.git
cd IE213
```

2. **Cài đặt Backend**
```bash
cd backend
npm install
```
Tạo file `.env` trong thư mục `backend`:
```env
PORT=10000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PINATA_JWT=your_pinata_jwt
FRONTEND_URL=http://localhost:5173
```

3. **Cài đặt Frontend**
```bash
cd ../frontend
npm install
```
Tạo file `.env` trong thư mục `frontend`:
```env
VITE_API_BASE_URL=http://localhost:10000
VITE_CONTRACT_ADDRESS=0xF79Fb7022B5AfB635FC0BD65682271db766bab14
VITE_NETWORK_ID=11155111
VITE_PINATA_JWT=your_pinata_jwt
```

4. **Khởi chạy ứng dụng**
- **Backend**: `npm run dev` (tại thư mục `/backend`)
- **Frontend**: `npm run dev` (tại thư mục `/frontend`)

---

## 🧪 Kiểm thử
Dự án sử dụng **Vitest** để thực hiện Unit Test và Integration Test cho Backend.
```bash
cd backend
npm test
```

---

## 🛡 Bảo mật & Quy trình
- **Xác thực**: Sử dụng JWT cho các phiên đăng nhập.
- **Blockchain**: Đảm bảo tính minh bạch và không thể giả mạo của phiếu bảo hành thông qua Smart Contract trên mạng Sepolia.
- **Dữ liệu**: Ảnh sản phẩm và metadata được lưu trữ phi tập trung trên IPFS thông qua Pinata.


