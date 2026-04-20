# API Contract - Warranties Card

Ngay cap nhat: 2026-04-17 (Refactored for IPFS & camelCase)

## 1) Data model dung cho FE

Warranty object:

```json
{
  "id": "661100aa22bb33cc44dd7711",
  "serialNumber": "SN-7K2M-2024-X9",
  "serialHash": "0x7fa0...",
  "productCode": "IP15-PRO-256",
  "ownerWallet": "0xA1b2C3d4E5f6...",
  "tokenId": "12345",
  "txHash": "0xabcde...",
  "tokenURI": "ipfs://bafkrei...",
  "status": true,
  "expiryDate": 1807541114,
  "mintedAt": "2026-04-01T10:05:00.000Z",
  "isActive": true,
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-01T10:05:00.000Z"
}
```

## 2) Endpoints

### 2.1 POST /api/warranties (Admin, Staff)

Muc dich:

- Tao phieu bao hanh Pre-mint (trang thai pending on-chain).
- Tu dong upload Metadata JSON len IPFS de chuan bi cho viec mint NFT.

Header:

- Authorization: Bearer <JWT_TOKEN>
- Content-Type: multipart/form-data

Request Body (Fields):

- `serialNumber`: "SN-7K2M-2024-X9" (Bat buoc)
- `productCode`: "IP15-PRO-256" (Bat buoc)
- `ownerWallet`: "0xA1b2C3d4E5f6..." (Bat buoc)
- `expiryDate`: 1807541114 (Unix timestamp, Tuy chon)
- `image`: [File anh] (Tuy chon, neu khong co se dung anh mac dinh cua Product)

Success 201:

```json
{
  "success": true,
  "message": "Tạo phiếu bảo hành Pre-mint thành công",
  "data": {
    "id": "661100aa22bb33cc44dd7711",
    "serialNumber": "SN-7K2M-2024-X9",
    "ownerWallet": "0xA1b2C3d4E5f6...",
    "productCode": "IP15-PRO-256",
    "tokenURI": "ipfs://bafkrei...",
    "status": true,
    "isActive": true
  }
}
```

### 2.2 PATCH /api/warranties/:id (Admin, Staff)

Muc dich:

- Cap nhat tokenId va txHash sau khi Mint thanh cong tren Blockchain.
- Tu dong tao mot ban ghi TransferHistory (0x0 -> owner).

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "tokenId": "12345",
  "txHash": "0xabcde...",
  "mintedAt": "2026-04-01T10:05:00.000Z"
}
```

Success 200:

```json
{
  "success": true,
  "message": "Cập nhật thông tin Mint thành công",
  "data": {
    "id": "661100aa22bb33cc44dd7711",
    "tokenId": "12345",
    "txHash": "0xabcde...",
    "status": true,
    "mintedAt": "2026-04-01T10:05:00.000Z"
  }
}
```

### 2.3 GET /api/warranties/my-warranties (User)

Header:

- Authorization: Bearer <JWT_TOKEN>

Success 200:

```json
{
  "success": true,
  "message": "Lấy danh sách bảo hành của tôi thành công",
  "data": [
    {
      "id": "661100aa22bb33cc44dd7711",
      "serialNumber": "SN-7K2M-2024-X9",
      "productCode": "IP15-PRO-256",
      "tokenId": "12345",
      "tokenURI": "ipfs://...",
      "status": true
    }
  ]
}
```

### 2.4 PATCH /api/warranties/:id/status (Admin)

Muc dich:
- Tam dung hoac Huy kich hoat phieu bao hanh.

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "status": false,
  "revokedReason": "Khách hàng vi phạm điều khoản bảo hành"
}
```

Success 200:

```json
{
  "success": true,
  "message": "Cập nhật trạng thái bảo hành thành công",
  "data": {
    "id": "661100aa22bb33cc44dd7711",
    "status": false,
    "revokedReason": "Khách hàng vi phạm điều khoản bảo hành",
    "revokedAt": "2026-04-05T12:00:00.000Z"
  }
}
```

### 2.5 GET /api/warranties/verify/:serialNumber (Public)

Muc dich: Tra cuu cong khai. ownerWallet se duoc an bot thong tin bao mat.

Success 200:

```json
{
  "success": true,
  "message": "Tra cứu bảo hành thành công",
  "data": {
    "serialNumber": "SN-7K2M-2024-X9",
    "ownerWallet": "0xA1b2...7711",
    "productCode": "IP15-PRO-256",
    "tokenURI": "ipfs://...",
    "isMinted": true,
    "expiryDate": 1807541114
  }
}
```

## 3) Error mau

```json
{
  "success": false,
  "error": {
    "code": "E403_FORBIDDEN",
    "message": "Insufficient permission",
    "details": []
  }
}
```
