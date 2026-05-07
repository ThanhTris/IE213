# 🏗️ Tài Liệu Kiến Trúc Hệ Thống E-Warranty

> **Mô tả**: Tài liệu này trình bày toàn diện kiến trúc của hệ thống Bảo Hành Điện Tử (E-Warranty) theo mô hình **Hybrid Web3**, bao gồm các sơ đồ Use Case, Sequence, ERD và Component Architecture.

---

## 📑 Mục lục
1. [Sơ đồ Use Case](#1-sơ-đồ-use-case)
2. [Sơ đồ Kiến trúc Hệ thống](#2-sơ-đồ-kiến-trúc-hệ-thống-component-architecture)
3. [Sơ đồ Tuần tự — Luồng Đúc NFT Bảo Hành](#3-sơ-đồ-tuần-tự--luồng-đúc-nft-bảo-hành-mint-warranty)
4. [Sơ đồ Tuần tự — Luồng Chuyển Nhượng NFT](#4-sơ-đồ-tuần-tự--luồng-chuyển-nhượng-nft-transfer)
5. [Sơ đồ Cơ sở Dữ liệu Off-chain (ERD)](#5-sơ-đồ-cơ-sở-dữ-liệu-off-chain-erd)
6. [Phân tách Dữ liệu On-chain vs Off-chain](#6-phân-tách-dữ-liệu-on-chain-vs-off-chain)
7. [Sơ đồ Trạng thái Sửa chữa](#7-sơ-đồ-trạng-thái-sửa-chữa-repair-state-machine)

---

## 1. Sơ đồ Use Case

Hệ thống E-Warranty phân chia người dùng thành **4 vai trò (Role)** chính, mỗi vai trò có tập hợp chức năng riêng biệt:

```mermaid
flowchart LR
    subgraph Actors
        Guest["🌐 Guest<br/>(Khách vãng lai)"]
        User["👤 User<br/>(Khách có ví MetaMask)"]
        Staff["🔧 Staff / Technician<br/>(Nhân viên kỹ thuật)"]
        Admin["👑 Admin<br/>(Quản trị viên)"]
    end

    subgraph UC_Public["Chức năng Công khai"]
        UC1["Tra cứu bảo hành<br/>bằng Serial Number"]
        UC2["Xác minh tính xác thực<br/>NFT trên Blockchain"]
    end

    subgraph UC_User["Chức năng Người dùng"]
        UC3["Đăng nhập bằng<br/>ví MetaMask"]
        UC4["Xem danh sách<br/>bảo hành sở hữu"]
        UC5["Chuyển nhượng NFT<br/>bảo hành cho người khác"]
        UC6["Xem lịch sử<br/>chuyển nhượng"]
        UC7["Cập nhật<br/>thông tin cá nhân"]
    end

    subgraph UC_Staff["Chức năng Nhân viên"]
        UC8["Tạo phiếu sửa chữa<br/>(Repair Log)"]
        UC9["Cập nhật trạng thái<br/>sửa chữa (Timeline)"]
        UC10["Quản lý sản phẩm<br/>(CRUD)"]
    end

    subgraph UC_Admin["Chức năng Quản trị"]
        UC11["Đúc NFT bảo hành mới<br/>(Mint Warranty)"]
        UC12["Quản lý tài khoản<br/>người dùng"]
        UC13["Xem Dashboard<br/>thống kê tổng quan"]
        UC14["Thu hồi / Hủy<br/>phiếu bảo hành"]
    end

    Guest --> UC1
    Guest --> UC2

    User --> UC1
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Staff --> UC3
    Staff --> UC8
    Staff --> UC9
    Staff --> UC10

    Admin --> UC3
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
```

### Giải thích vai trò:

| Vai trò | Xác thực | Mô tả |
|---------|----------|-------|
| **Guest** | Không cần | Bất kỳ ai truy cập web đều có thể tra cứu và xác minh bảo hành. |
| **User** | MetaMask + JWT | Khách hàng đã kết nối ví. Sở hữu NFT bảo hành và có quyền chuyển nhượng. |
| **Staff / Technician** | MetaMask + JWT (role: staff) | Nhân viên kỹ thuật. Tiếp nhận thiết bị, ghi nhận tiến trình sửa chữa. |
| **Admin** | MetaMask + JWT (role: admin) | Chủ cửa hàng / người triển khai Smart Contract. Có toàn quyền quản trị và đúc NFT. |

---

## 2. Sơ đồ Kiến trúc Hệ thống (Component Architecture)

Sơ đồ dưới đây mô tả cách **5 thành phần cốt lõi** của hệ thống kết nối và giao tiếp với nhau:

```mermaid
graph TB
    subgraph Client["🖥️ CLIENT (Trình duyệt)"]
        FE["Frontend<br/>React.js + Vite"]
        MM["MetaMask<br/>(Ví Web3)"]
    end

    subgraph Server["☁️ SERVER (Render.com)"]
        BE["Backend API<br/>Node.js + Express"]
        DB[("MongoDB Atlas<br/>(Off-chain Database)")]
    end

    subgraph Decentralized["🌐 PHÂN TÁN (Decentralized)"]
        IPFS["Pinata IPFS<br/>(Lưu trữ Metadata + Ảnh)"]
        BC["Ethereum Sepolia<br/>(Smart Contract ERC-721)"]
    end

    FE -->|"REST API<br/>(Axios + JWT)"| BE
    FE -->|"ethers.js<br/>(Ký giao dịch)"| MM
    MM -->|"JSON-RPC<br/>(Gửi Transaction)"| BC
    BE -->|"Mongoose<br/>(CRUD Operations)"| DB
    BE -->|"Pinata SDK<br/>(Upload ảnh + JSON)"| IPFS
    BC -.->|"tokenURI<br/>(Trỏ đến Metadata)"| IPFS

    style Client fill:#1a1a2e,stroke:#e94560,color:#fff
    style Server fill:#16213e,stroke:#0f3460,color:#fff
    style Decentralized fill:#0f3460,stroke:#533483,color:#fff
```

### Vai trò của từng thành phần:

| Thành phần | Công nghệ | Vai trò |
|------------|-----------|---------|
| **Frontend** | React.js, Vite, SWR, ethers.js | Giao diện người dùng. Gửi dữ liệu lên Backend, điều phối MetaMask ký giao dịch. |
| **Backend** | Node.js, Express, Mongoose, Multer | Xử lý nghiệp vụ. Xác thực JWT, upload IPFS, quản lý CSDL. Bảo vệ toàn bộ Secret Key. |
| **MongoDB Atlas** | MongoDB (Cloud) | Lưu trữ dữ liệu Off-chain: Sản phẩm, Người dùng, Lịch sử sửa chữa, Bản sao bảo hành. |
| **Pinata IPFS** | IPFS Protocol | Lưu trữ phi tập trung: Ảnh sản phẩm và Metadata JSON cho NFT. Dữ liệu bất biến. |
| **Smart Contract** | Solidity (ERC-721), Sepolia | Đảm bảo quyền sở hữu bảo hành trên Blockchain. Chống giả mạo, cho phép chuyển nhượng. |

---

## 3. Sơ đồ Tuần tự — Luồng Đúc NFT Bảo Hành (Mint Warranty)

Đây là luồng cốt lõi của hệ thống, mô tả chi tiết **12 bước** từ lúc Admin điền form đến khi NFT được đúc thành công:

```mermaid
sequenceDiagram
    actor Admin as 👑 Admin (Trình duyệt)
    participant FE as Frontend (React.js)
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant IPFS as Pinata (IPFS)
    participant MM as MetaMask
    participant SC as Smart Contract (Sepolia)

    Note over Admin,SC: BƯỚC 1 — Chuẩn bị dữ liệu và Upload IPFS

    Admin->>FE: 1. Điền form bảo hành + Chọn ảnh sản phẩm
    FE->>BE: 2. POST /api/warranties (FormData: serial, productCode, ownerWallet, image)
    BE->>BE: 3. Validate input (Zero-trust whitelist)
    BE->>IPFS: 4. Upload ảnh sản phẩm lên IPFS
    IPFS-->>BE: 5. Trả về imageCID (ipfs://Qm...)
    BE->>IPFS: 6. Upload Metadata JSON (name, image, serial, expiry)
    IPFS-->>BE: 7. Trả về tokenURI (ipfs://Qm...)
    BE->>DB: 8. Lưu bản nháp Warranty (chưa có txHash)
    BE-->>FE: 9. Trả về {id, tokenURI, serialHash, expiryTimestamp}

    Note over Admin,SC: BƯỚC 2 — Ký giao dịch Blockchain

    FE->>MM: 10. Gọi contract.mintWarranty(to, tokenURI, serialHash, expiry)
    MM->>Admin: 11. Hiện popup xác nhận giao dịch
    Admin->>MM: 12. Nhấn "Confirm" (Ký bằng Private Key)
    MM->>SC: 13. Gửi Transaction lên mạng Sepolia
    SC->>SC: 14. Thực thi: _safeMint() + lưu WarrantyData on-chain
    SC-->>MM: 15. Trả về Transaction Receipt
    MM-->>FE: 16. Trả về {txHash, tokenId}

    Note over Admin,SC: BƯỚC 3 — Đồng bộ kết quả về Backend

    FE->>BE: 17. PATCH /api/warranties/:id {txHash, tokenId, status: true}
    BE->>DB: 18. Cập nhật txHash, tokenId, mintedAt
    BE->>DB: 19. Tạo TransferHistory (mint: 0x000...→ ownerWallet)
    BE-->>FE: 20. Trả về kết quả thành công
    FE->>Admin: 21. Hiển thị thông báo "Đúc NFT thành công!"
```

### Xử lý lỗi trong luồng Mint:
- **Bước 12 — Admin bấm "Reject"**: MetaMask ném lỗi `code: 4001`. Frontend bắt lỗi, hiển thị thông báo thân thiện. Bản nháp DB vẫn được giữ lại để Admin thử lại mà không cần tạo mới.
- **Bước 13 — Giao dịch thất bại trên chain**: Frontend hiển thị lỗi RPC. Bản nháp DB không bị xóa, Admin có thể retry.

---

## 4. Sơ đồ Tuần tự — Luồng Chuyển Nhượng NFT (Transfer)

Khi khách hàng muốn chuyển phiếu bảo hành cho người khác (ví dụ: bán lại thiết bị cũ):

```mermaid
sequenceDiagram
    actor Owner as 👤 Chủ sở hữu hiện tại
    participant FE as Frontend (React.js)
    participant MM as MetaMask
    participant SC as Smart Contract (Sepolia)
    participant BE as Backend (Express)
    participant DB as MongoDB

    Owner->>FE: 1. Nhập địa chỉ ví người nhận
    FE->>FE: 2. Validate địa chỉ ví (Regex EVM)
    FE->>MM: 3. Gọi contract.transferFrom(from, to, tokenId)
    MM->>Owner: 4. Hiện popup xác nhận
    Owner->>MM: 5. Ký giao dịch
    MM->>SC: 6. Gửi Transaction chuyển nhượng
    SC->>SC: 7. Cập nhật ownerOf(tokenId) → ví mới
    SC-->>FE: 8. Trả về Transaction Receipt

    FE->>BE: 9. POST /api/transfer-history + PATCH /api/warranties/:id
    BE->>DB: 10. Tạo TransferHistory (transfer: old → new)
    BE->>DB: 11. Cập nhật ownerWallet trong Warranty
    BE-->>FE: 12. Xác nhận thành công
    FE->>Owner: 13. Thông báo "Chuyển nhượng thành công!"
```

---

## 5. Sơ đồ Cơ sở Dữ liệu Off-chain (ERD)

Hệ thống sử dụng **MongoDB** (NoSQL) với 5 Collection chính. Dưới đây là sơ đồ quan hệ logic giữa các Collection:

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string walletAddress UK "0x... (lowercase, 42 ký tự)"
        string email UK "Sparse index - có thể null"
        string fullName
        string phone
        enum role "admin | staff | technician | user"
        boolean isActive
        object notificationSettings
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT {
        ObjectId _id PK
        string productCode UK "VD: IP15PM-256-BK"
        string productName "Tên sản phẩm"
        string brand "Hãng sản xuất"
        string color
        string config "Cấu hình chi tiết"
        string imageUrl "http:// hoặc ipfs://"
        number price
        number warrantyMonths "Số tháng bảo hành mặc định"
        string description
        boolean isActive
    }

    WARRANTY {
        ObjectId _id PK
        string serialNumber UK "Số serial thiết bị"
        string serialHash UK "SHA-256 hash của serialNumber"
        string productCode FK "Tham chiếu Product"
        string ownerWallet FK "Tham chiếu User"
        string tokenId "ID của NFT trên blockchain"
        string txHash "Hash giao dịch Mint"
        string tokenURI "IPFS URI chứa metadata"
        number expiryDate "Unix timestamp hết hạn"
        boolean status "true = đang hiệu lực"
        datetime mintedAt "Thời điểm đúc NFT"
        datetime revokedAt
        string revokedReason
        boolean isActive
    }

    REPAIR_LOG {
        ObjectId _id PK
        ObjectId warrantyId FK "Tham chiếu Warranty"
        string serialNumber FK "Số serial thiết bị"
        string technicianWallet FK "Ví kỹ thuật viên"
        enum currentStatus "pending - waiting_parts - fixing - completed - delivered - cancelled"
        boolean isWarrantyCovered "true = miễn phí bảo hành"
        number cost "Chi phí sửa chữa"
        array timeline "Mảng các bước trạng thái"
        enum type "Màn hình | Pin | Phần cứng | Phần mềm | Khác"
        datetime repairDate
    }

    TRANSFER_HISTORY {
        ObjectId _id PK
        string tokenId FK "ID NFT trên blockchain"
        string serialNumber FK "Số serial thiết bị"
        string fromAddress "Ví gửi (0x000... nếu mint)"
        string toAddress FK "Ví nhận"
        string txHash UK "Hash giao dịch trên blockchain"
        enum transferType "mint | transfer | burn"
        datetime transferDate
    }

    USER ||--o{ WARRANTY : "sở hữu (ownerWallet)"
    PRODUCT ||--o{ WARRANTY : "thuộc loại (productCode)"
    WARRANTY ||--o{ REPAIR_LOG : "có lịch sử sửa chữa"
    WARRANTY ||--o{ TRANSFER_HISTORY : "có lịch sử chuyển nhượng"
    USER ||--o{ REPAIR_LOG : "thực hiện bởi (technicianWallet)"
```

---

## 6. Phân tách Dữ liệu On-chain vs Off-chain

Đây là điểm mấu chốt của kiến trúc **Hybrid Web3** — biết đặt dữ liệu đúng chỗ để vừa đảm bảo tính bất biến, vừa tối ưu chi phí gas:

```mermaid
graph LR
    subgraph ON["⛓️ ON-CHAIN (Blockchain Sepolia)"]
        direction TB
        OC1["tokenId — ID duy nhất của NFT"]
        OC2["ownerOf — Địa chỉ ví chủ sở hữu hiện tại"]
        OC3["tokenURI — Đường dẫn IPFS metadata"]
        OC4["serialHash — Hash của serial (chống đúc trùng)"]
        OC5["expiryDate — Ngày hết hạn bảo hành"]
        OC6["isActive — Trạng thái hiệu lực"]
    end

    subgraph OFF["🗄️ OFF-CHAIN (MongoDB)"]
        direction TB
        OF1["Thông tin chi tiết Sản phẩm"]
        OF2["Thông tin Người dùng (email, SĐT, role)"]
        OF3["Lịch sử Sửa chữa (timeline)"]
        OF4["Bản sao bảo hành (tra cứu nhanh)"]
        OF5["Lịch sử Chuyển nhượng"]
        OF6["Thống kê / Dashboard"]
    end

    subgraph IPFS["📦 IPFS (Pinata - Bất biến)"]
        direction TB
        IP1["Ảnh sản phẩm gốc"]
        IP2["Metadata JSON (name, image, attributes)"]
    end

    style ON fill:#1b4332,stroke:#2d6a4f,color:#fff
    style OFF fill:#1a1a2e,stroke:#16213e,color:#fff
    style IPFS fill:#3d0066,stroke:#7b2cbf,color:#fff
```

### Tại sao phân tách như vậy?

| Tiêu chí | On-chain (Blockchain) | Off-chain (MongoDB) | IPFS |
|----------|----------------------|---------------------|------|
| **Chi phí** | Rất cao (tốn Gas mỗi lần ghi) | Gần như miễn phí | Miễn phí (Pinata Free tier) |
| **Tốc độ** | Chậm (15-30 giây/block) | Rất nhanh (< 100ms) | Nhanh khi đọc |
| **Tính bất biến** | ✅ Tuyệt đối (không ai sửa được) | ❌ Có thể sửa/xóa | ✅ Bất biến (CID-based) |
| **Dữ liệu phù hợp** | Quyền sở hữu, chống giả mạo | Nghiệp vụ thay đổi thường xuyên | File lớn (ảnh, JSON) |

### Nguyên tắc thiết kế:
- **Dữ liệu cần chống giả mạo** (quyền sở hữu, tính xác thực) → **On-chain**.
- **Dữ liệu cần truy vấn nhanh và thay đổi thường xuyên** (sửa chữa, thống kê, thông tin cá nhân) → **Off-chain (MongoDB)**.
- **File nhị phân và metadata cần tồn tại vĩnh viễn** (ảnh sản phẩm, JSON metadata) → **IPFS**.
- **Đồng bộ hóa**: Backend luôn giữ một bản sao (mirror) của dữ liệu on-chain (txHash, tokenId, ownerWallet) trong MongoDB để phục vụ truy vấn tức thì mà không cần gọi Blockchain.

---

## 7. Sơ đồ Trạng thái Sửa chữa (Repair State Machine)

Mỗi phiếu sửa chữa (Repair Log) trong hệ thống tuân theo một quy trình chuyển trạng thái nghiêm ngặt, tương tự như ứng dụng theo dõi giao hàng:

```mermaid
stateDiagram-v2
    [*] --> pending: Tiếp nhận thiết bị

    pending --> waiting_parts: Cần đặt linh kiện
    pending --> fixing: Bắt đầu sửa chữa
    pending --> cancelled: Khách hủy yêu cầu

    waiting_parts --> fixing: Linh kiện đã về
    waiting_parts --> cancelled: Hủy (hết hàng)

    fixing --> waiting_parts: Phát hiện cần thêm linh kiện
    fixing --> completed: Sửa chữa hoàn tất
    fixing --> cancelled: Không thể sửa

    completed --> delivered: Giao trả thiết bị cho khách

    delivered --> [*]
    cancelled --> [*]

    note right of pending: Trạng thái mặc định
    note right of delivered: Trạng thái kết thúc
    note right of cancelled: Trạng thái kết thúc
```

### Mô tả trạng thái:

| Trạng thái | Tiếng Việt | Mô tả |
|-----------|-----------|-------|
| `pending` | Tiếp nhận | Thiết bị vừa được tiếp nhận tại cửa hàng |
| `waiting_parts` | Chờ linh kiện | Cần đặt mua linh kiện thay thế |
| `fixing` | Đang sửa | Kỹ thuật viên đang tiến hành sửa chữa |
| `completed` | Hoàn tất | Sửa chữa xong, chờ khách đến nhận |
| `delivered` | Đã giao | Đã trả thiết bị cho khách hàng ✅ |
| `cancelled` | Đã hủy | Phiếu sửa chữa bị hủy bỏ ❌ |
