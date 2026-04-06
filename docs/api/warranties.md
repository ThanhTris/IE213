# API Contract - Warranties

Ngay cap nhat: 2026-04-05

## 1) Data model dung cho FE

Warranty object:

```json
{
  "_id": "661100aa22bb33cc44dd7711",
  "serialNumber": "SN-7K2M-2024-X9",
  "serialHash": "0x7fa0...",
  "productModel": "IP15-PRO-256",
  "ownerAddress": "0xA1b2C3d4E5f6...",
  "tokenId": "12345",
  "txHash": "0xabcde...",
  "status": "active",
  "soldAt": "2026-04-01T10:00:00.000Z",
  "mintedAt": "2026-04-01T10:05:00.000Z",
  "notes": "Sold at HCM Store",
  "createdBy": "0xStaffWallet...",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-01T10:05:00.000Z"
}
```

## 2) Endpoints

### 2.1 POST /api/warranties (Admin, Staff)

Muc dich:

- Pre-mint tao so bao hanh voi status pending.

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "serialNumber": "SN-7K2M-2024-X9",
  "productModel": "IP15-PRO-256",
  "ownerAddress": "0xA1b2C3d4E5f6...",
  "soldAt": "2026-04-01T10:00:00.000Z",
  "notes": "Sold at HCM Store"
}
```

Success 201:

```json
{
  "success": true,
  "message": "Warranty created",
  "data": {
    "_id": "661100aa22bb33cc44dd7711",
    "serialNumber": "SN-7K2M-2024-X9",
    "serialHash": "0x7fa0...",
    "productModel": "IP15-PRO-256",
    "ownerAddress": "0xA1b2C3d4E5f6...",
    "tokenId": "",
    "txHash": "",
    "status": "pending"
  }
}
```

### 2.2 PATCH /api/warranties/:id (Admin, Staff)

Muc dich:

- Post-mint cap nhat txHash va tokenId sau khi mint NFT thanh cong.

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
  "message": "Warranty updated",
  "data": {
    "_id": "661100aa22bb33cc44dd7711",
    "tokenId": "12345",
    "txHash": "0xabcde...",
    "status": "active",
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
  "message": "My warranties retrieved",
  "data": [
    {
      "_id": "661100aa22bb33cc44dd7711",
      "serialNumber": "SN-7K2M-2024-X9",
      "productModel": "IP15-PRO-256",
      "tokenId": "12345",
      "status": "active"
    }
  ]
}
```

### 2.4 PATCH /api/warranties/:id/status (Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "status": "revoked"
}
```

Success 200:

```json
{
  "success": true,
  "message": "Warranty status updated",
  "data": {
    "_id": "661100aa22bb33cc44dd7711",
    "status": "revoked",
    "updatedAt": "2026-04-05T12:00:00.000Z"
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
