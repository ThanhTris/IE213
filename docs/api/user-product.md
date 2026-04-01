# API Contract Mẫu - User & Product

Ngày cập nhật: 2026-03-22
Mục tiêu: BE chốt contract trước để FE dùng mock data, sau đó thay endpoint thật mà không đổi cấu trúc dữ liệu.

## 1) Chuẩn JSON dùng chung

### Success Response

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "...",
    "message": "...",
    "details": []
  }
}
```

## 2) Error Codes chuẩn

| Code               | HTTP | Ý nghĩa                                      |
| ------------------ | ---- | -------------------------------------------- |
| E400_VALIDATION    | 400  | Dữ liệu đầu vào không hợp lệ                 |
| E400_MISSING_FIELD | 400  | Thiếu trường bắt buộc                        |
| E401_UNAUTHORIZED  | 401  | Chưa xác thực ví/người dùng                  |
| E403_FORBIDDEN     | 403  | Không đủ quyền thao tác                      |
| E404_NOT_FOUND     | 404  | Không tìm thấy tài nguyên                    |
| E409_DUPLICATE     | 409  | Dữ liệu bị trùng (walletAddress/productCode) |
| E500_INTERNAL      | 500  | Lỗi hệ thống                                 |

## 3) User APIs

### 3.1 POST /api/users/auth

Mục đích: Đăng nhập/đăng ký theo walletAddress.

Request

```json
{
  "walletAddress": "0x1234...abcd",
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0909000999"
}
```

Success (201 hoặc 200)

```json
{
  "success": true,
  "message": "User authenticated",
  "data": {
    "_id": "usr_001",
    "walletAddress": "0x1234...abcd",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0909000999",
    "createdAt": "2026-03-22T10:00:00.000Z",
    "updatedAt": "2026-03-22T10:00:00.000Z"
  }
}
```

Error mẫu

```json
{
  "success": false,
  "error": {
    "code": "E400_MISSING_FIELD",
    "message": "walletAddress is required",
    "details": ["walletAddress"]
  }
}
```

### 3.2 GET /api/users/me?walletAddress=0x...

Mục đích: Lấy hồ sơ user theo ví.

Success (200)

```json
{
  "success": true,
  "message": "User found",
  "data": {
    "_id": "usr_001",
    "walletAddress": "0x1234...abcd",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0909000999"
  }
}
```

### 3.3 PUT /api/users/:walletAddress

Mục đích: Cập nhật thông tin user.

Request

```json
{
  "fullName": "Nguyen Van B",
  "email": "b@example.com",
  "phone": "0911222333"
}
```

Success (200)

```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "_id": "usr_001",
    "walletAddress": "0x1234...abcd",
    "fullName": "Nguyen Van B",
    "email": "b@example.com",
    "phone": "0911222333",
    "updatedAt": "2026-03-22T11:00:00.000Z"
  }
}
```

### 3.4 GET /api/users

Mục đích: Lấy danh sách user.

Success (200)

```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "_id": "usr_001",
      "walletAddress": "0x1234...abcd",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "phone": "0909000999"
    },
    {
      "_id": "usr_002",
      "walletAddress": "0x9999...eeee",
      "fullName": "Tran Thi B",
      "email": "b@example.com",
      "phone": "0911000222"
    }
  ]
}
```

## 4) Product APIs

### 4.1 POST /api/products

Mục đích: Tạo sản phẩm mới.

Request

```json
{
  "productCode": "P001",
  "productName": "Phone X",
  "brand": "Brand A",
  "price": 999,
  "warrantyMonths": 12
}
```

Success (201)

```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "_id": "prd_001",
    "productCode": "P001",
    "productName": "Phone X",
    "brand": "Brand A",
    "price": 999,
    "warrantyMonths": 12,
    "isActive": true,
    "createdAt": "2026-03-22T10:20:00.000Z",
    "updatedAt": "2026-03-22T10:20:00.000Z"
  }
}
```

Error duplicate (409)

```json
{
  "success": false,
  "error": {
    "code": "E409_DUPLICATE",
    "message": "productCode already exists",
    "details": ["productCode"]
  }
}
```

### 4.2 GET /api/products

Mục đích: Lấy danh sách sản phẩm.

Success (200)

```json
{
  "success": true,
  "message": "Products retrieved",
  "data": [
    {
      "_id": "prd_001",
      "productCode": "P001",
      "productName": "Phone X",
      "brand": "Brand A",
      "price": 999,
      "warrantyMonths": 12,
      "isActive": true
    }
  ]
}
```

### 4.3 GET /api/products/:idOrCode

Mục đích: Lấy chi tiết sản phẩm.

Success (200)

```json
{
  "success": true,
  "message": "Product found",
  "data": {
    "_id": "prd_001",
    "productCode": "P001",
    "productName": "Phone X",
    "brand": "Brand A",
    "price": 999,
    "warrantyMonths": 12,
    "isActive": true
  }
}
```

### 4.4 PUT /api/products/:idOrCode

Mục đích: Cập nhật sản phẩm.

Request

```json
{
  "productName": "Phone X Pro",
  "price": 1099,
  "warrantyMonths": 18
}
```

Success (200)

```json
{
  "success": true,
  "message": "Product updated",
  "data": {
    "_id": "prd_001",
    "productCode": "P001",
    "productName": "Phone X Pro",
    "brand": "Brand A",
    "price": 1099,
    "warrantyMonths": 18,
    "isActive": true,
    "updatedAt": "2026-03-22T11:10:00.000Z"
  }
}
```

### 4.5 DELETE /api/products/:idOrCode

Mục đích: Xóa mềm sản phẩm.

Success (200)

```json
{
  "success": true,
  "message": "Product disabled",
  "data": {
    "_id": "prd_001",
    "productCode": "P001",
    "isActive": false
  }
}
```

## 5) Testcase checklist BE

### User

- [ ] POST /api/users/auth: thiếu walletAddress -> E400_MISSING_FIELD.
- [ ] POST /api/users/auth: walletAddress đã tồn tại -> trả 200 với dữ liệu user cũ hoặc 409 theo rule team chốt.
- [ ] GET /api/users/me: không có query walletAddress -> E400_MISSING_FIELD.
- [ ] PUT /api/users/:walletAddress: body rỗng -> E400_VALIDATION.
- [ ] GET /api/users: trả mảng user đúng schema.

### Product

- [ ] POST /api/products: thiếu productCode/productName/brand -> E400_MISSING_FIELD.
- [ ] POST /api/products: trùng productCode -> E409_DUPLICATE.
- [ ] GET /api/products: trả mảng product đúng schema.
- [ ] GET /api/products/:idOrCode: không tồn tại -> E404_NOT_FOUND.
- [ ] PUT /api/products/:idOrCode: body rỗng -> E400_VALIDATION.
- [ ] DELETE /api/products/:idOrCode: cập nhật isActive=false.

## 6) Checklist FE dùng mock ngay

- [ ] Tạo file mock users/products theo đúng cấu trúc data ở tài liệu này.
- [ ] Render UI không hardcode key khác schema đã chốt.
- [ ] Service layer FE giữ nguyên shape response để chuyển API thật không phải sửa UI lớn.

## 7) Warranty & Transfer (mint/transfer)

FE cần mock thêm các endpoint liên quan workflow mint và chuyển nhượng.

7.1 POST /api/warranties

Mục đích: Tạo bản ghi bảo hành (pre-mint). Hỗ trợ truyền `warrantyMonths` để tính `expiryDate`.

Request

```json
{
  "productId": "prd_001",
  "serialNumber": "SN-001",
  "ownerAddress": "0x1234...abcd",
  "warrantyMonths": 12
}
```

Success (201)

```json
{
  "success": true,
  "message": "Warranty created",
  "data": {
    "_id": "wty_001",
    "productId": "prd_001",
    "serialNumber": "SN-001",
    "ownerAddress": "0x1234...abcd",
    "warrantyMonths": 12,
    "expiryDate": "2027-03-30T00:00:00.000Z",
    "status": false
  }
}
```

7.2 PATCH /api/warranties/:id (mint)

Mục đích: Ghi nhận thông tin mint từ on-chain indexer hoặc admin — cập nhật `tokenId`, `mintTxHash`, `mintedAt` và set `status` active; kèm tạo `TransferHistory` với `transferType: "mint"` (from zero address).

Request

```json
{
  "tokenId": "1234",
  "txHash": "0xabc...123"
}
```

Success (200)

```json
{
  "success": true,
  "message": "Warranty minted",
  "data": {
    "_id": "wty_001",
    "tokenId": "1234",
    "mintTxHash": "0xabc...123",
    "mintedAt": "2026-03-30T12:00:00.000Z",
    "status": true
  }
}
```

7.3 POST /api/transfers

Mục đích: Ghi nhận giao dịch chuyển nhượng off-chain (hoặc từ indexer) — endpoint yêu cầu `Authorization` (JWT) và chỉ cho phép chủ sở hữu hiện tại (`req.user.walletAddress`) thực hiện.

Request

```json
{
  "warrantyId": "wty_001",
  "from": "0xOldOwner",
  "to": "0xNewOwner",
  "tokenId": "1234",
  "txHash": "0xdef...456"
}
```

Success (201)

```json
{
  "success": true,
  "message": "Transfer recorded",
  "data": {
    "_id": "th_001",
    "warrantyId": "wty_001",
    "from": "0xOldOwner",
    "to": "0xNewOwner",
    "tokenId": "1234",
    "txHash": "0xdef...456",
    "transferType": "transfer",
    "createdAt": "2026-03-30T13:00:00.000Z"
  }
}
```

7.4 Public GET history endpoints (no auth)

- GET `/api/transfers/tx/:txHash` — trả chi tiết transfer theo `txHash`.
- GET `/api/transfers/token/:tokenId` — trả danh sách `TransferHistory` theo `tokenId`.

FE note: sử dụng cấu trúc envelope `success/message/data` như phần còn lại để dễ chuyển từ mock sang API thật.
