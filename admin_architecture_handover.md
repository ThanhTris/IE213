# 🏛️ Tài liệu Ngữ cảnh: Tái cấu trúc Admin Portal (E-Warranty)

Tài liệu này ghi lại quá trình và kết quả của việc tái cấu trúc hệ thống Admin nhằm chuẩn hóa quy trình phát triển và tối ưu hóa trải nghiệm người dùng (UX).

## 1. Mục tiêu & Vấn đề trước đó
- **Vấn đề**: Các file trang Admin nằm chung một thư mục phẳng, quản lý tab bằng State gây khó khăn khi SEO/Deep-link, CSS chứa nhiều mã màu hex cứng không đồng bộ.
- **Giải pháp**: Phân chia Domain (Dashboard vs Workspace), áp dụng Nested Routing và chuẩn hóa Design Tokens.

## 2. Thay đổi về Cấu trúc Thư mục (Directory Structure)

Hiện tại, mã nguồn Admin được tổ chức thành 2 thư mục con theo chức năng:

```text
src/pages/admin/
├── dashboard/           # Các trang hiển thị/thống kê
│   ├── AdminDashboard.jsx  # Layout cha Dashboard
│   ├── ProductList.jsx     # Danh sách sản phẩm
│   ├── RepairHistory.jsx   # Lịch sử sửa chữa
│   └── UserManagement.jsx  # Quản lý người dùng
└── workspace/           # Các trang thao tác nghiệp vụ
    ├── AdminWorkspacePage.jsx # Layout cha Workspace
    ├── CreateNewProduct.jsx   # Form thêm sản phẩm
    ├── CreateWarranty.jsx     # Form cấp bảo hành NFT
    └── LogRepairs.jsx         # Form ghi nhận sửa chữa
```

## 3. Hệ thống Định tuyến (Nested Routing)

Thay vì dùng `useState` để chuyển tab, ứng dụng hiện sử dụng `react-router-dom` để quản lý URL.

### Cấu hình tại `App.jsx`:
- **Parent `/admin`**: Tự động redirect về `/admin/dashboard`.
- **Phân vùng Dashboard (`/admin/dashboard/*`)**:
  - `/admin/dashboard/products`: Mặc định.
  - `/admin/dashboard/repair-history`: Lịch sử.
  - `/admin/dashboard/user-management`: Người dùng.
- **Phân vùng Workspace (`/admin/workspace/*`)**:
  - `/admin/workspace/warranty`: Mặc định.
  - `/admin/workspace/repair`: Sửa chữa.
  - `/admin/workspace/product`: Sản phẩm.

### Thành phần kỹ thuật:
- **`NavLink`**: Được dùng trong các thanh Tab để tự động nhận diện class `.active` dựa trên URL.
- **`Outlet`**: Đặt trong trang cha (`AdminDashboard` & `AdminWorkspacePage`) để hiển thị các trang con tương ứng.

## 4. Quy chuẩn CSS & Chiến lược Tách biệt Styles

Để hỗ trợ làm việc nhóm và tránh xung đột giao diện (style conflicts), hệ thống CSS được chia tách nghiêm ngặt:

- **`adminWorkspace.css` (Trang Nghiệp vụ)**: 
  - Đây là file CSS đã được chuẩn hóa (quy chuẩn biến màu, layout flex/grid). 
  - Được sử dụng cho toàn bộ các trang trong thư mục `workspace/`. 
  - **Trạng thái**: Đã sẵn sàng và đạt chuẩn.

- **`adminDashboard.css` (Trang Tổng quan)**: 
  - File này được dành riêng cho các thành phần của Dashboard (biểu đồ, danh sách thống kê). 
  - **Chiến lược**: Cho phép chèn mã code CSS trực tiếp từ các nguồn/máy khác vào đây. Việc tách riêng file này đảm bảo khi chỉnh sửa Dashboard sẽ **không làm thay đổi hay vỡ layout** của các trang Workspace.

### Quy tắc quan trọng:
1. Không viết code style của Dashboard vào file Workspace và ngược lại.
2. Luôn ưu tiên sử dụng Design Tokens (biến CSS) để khi chèn code từ nguồn khác vào vẫn giữ được sự đồng bộ về màu sắc cơ bản.

## 5. Lưu ý cho việc Config & Phát triển tiếp theo

1. **Import Paths**: Do file đã nằm sâu hơn, mọi import từ `services/` hoặc `utils/` phải dùng tiền tố `../../../`.
2. **Thêm Tab mới**:
   - Bước 1: Khai báo Route con trong `App.jsx`.
   - Bước 2: Thêm `NavLink` vào mảng `tabs` trong trang cha tương ứng.
3. **Quản lý Layout**: Các biểu đồ và metrics trong Dashboard nằm ở trang cha (`AdminDashboard.jsx`), do đó chúng sẽ luôn hiển thị phía trên bất kể bạn đang ở tab con nào bên dưới.

---
*Tài liệu này được tạo vào ngày 28/04/2026 để hỗ trợ việc đồng bộ hóa dự án IE213.*
