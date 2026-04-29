# API Contract - Transfer Histories

Ngay cap nhat: 2026-04-17 (Refactored)

## 1) Data model dung cho FE

TransferHistory object:

```json
{
  "id": "661100aa22bb33cc44dd9911",
  "tokenId": "12345",
  "serialNumber": "SN-7K2M-2024-X9",
  "transferType": "transfer",
  "fromAddress": "0xOldOwner...",
  "toAddress": "0xNewOwner...",
  "txHash": "0xfeedface...",
  "transferDate": "2026-04-04T11:12:00.000Z",
  "createdAt": "2026-04-04T11:12:05.000Z",
  "updatedAt": "2026-04-04T11:12:05.000Z"
}
```

## 2) Endpoints

### 2.1 POST /api/transfers (User)

Muc dich:

- FE bao cao giao dich chuyen nhuong thanh cong on-chain de dong bo DB.

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "tokenId": "12345",
  "toAddress": "0xNewOwner...",
  "txHash": "0xfeedface..."
}
```

Success 201:

```json
{
  "success": true,
  "message": "Ghi nhận lịch sử chuyển nhượng thành công",
  "data": {
    "id": "661100aa22bb33cc44dd9911",
    "tokenId": "12345",
    "fromAddress": "0xOldOwner...",
    "toAddress": "0xNewOwner...",
    "txHash": "0xfeedface...",
    "transferDate": "2026-04-04T11:12:00.000Z"
  }
}
```

### 2.2 GET /api/transfers/token/:tokenId (Public)

Muc dich:

- Xem lich su mint/transfer cua 1 token NFT bao hanh.

Success 200:

```json
{
  "success": true,
  "message": "Lấy lịch sử token thành công",
  "data": [
    {
      "id": "661100aa22bb33cc44dd9910",
      "tokenId": "12345",
      "transferType": "mint",
      "fromAddress": "0x0000000000000000000000000000000000000000",
      "toAddress": "0xOldOwner...",
      "txHash": "0xabcdmint...",
      "transferDate": "2026-04-01T10:05:00.000Z"
    },
    {
      "id": "661100aa22bb33cc44dd9911",
      "tokenId": "12345",
      "transferType": "transfer",
      "fromAddress": "0xOldOwner...",
      "toAddress": "0xNewOwner...",
      "txHash": "0xfeedface...",
      "transferDate": "2026-04-04T11:12:00.000Z"
    }
  ]
}
```

## 3) Error mau

```json
{
  "success": false,
  "error": {
    "code": "E404_NOT_FOUND",
    "message": "Transfer history not found for tokenId",
    "details": []
  }
}
```
