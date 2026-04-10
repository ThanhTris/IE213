# API Contract - Transfer Histories

Ngay cap nhat: 2026-04-05

## 1) Data model dung cho FE

TransferHistory object:

```json
{
  "_id": "661100aa22bb33cc44dd9911",
  "warrantyId": "661100aa22bb33cc44dd7711",
  "tokenId": "12345",
  "transferType": "transfer",
  "from": "0xOldOwner...",
  "to": "0xNewOwner...",
  "txHash": "0xfeedface...",
  "transferAt": "2026-04-04T11:12:00.000Z",
  "createdAt": "2026-04-04T11:12:05.000Z",
  "updatedAt": "2026-04-04T11:12:05.000Z"
}
```

## 2) Endpoints

### 2.1 POST /api/transfers (User)

Muc dich:

- FE bao cao giao dich chuyen nhuong thanh cong on-chain.

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "warrantyId": "661100aa22bb33cc44dd7711",
  "tokenId": "12345",
  "transferType": "transfer",
  "from": "0xOldOwner...",
  "to": "0xNewOwner...",
  "txHash": "0xfeedface...",
  "transferAt": "2026-04-04T11:12:00.000Z"
}
```

Success 201:

```json
{
  "success": true,
  "message": "Transfer recorded",
  "data": {
    "_id": "661100aa22bb33cc44dd9911",
    "tokenId": "12345",
    "transferType": "transfer",
    "from": "0xOldOwner...",
    "to": "0xNewOwner...",
    "txHash": "0xfeedface...",
    "transferAt": "2026-04-04T11:12:00.000Z"
  }
}
```

### 2.2 GET /api/transfers/token/:tokenId (Public)

Muc dich:

- Xem lich su mint/transfer cua 1 so bao hanh.

Success 200:

```json
{
  "success": true,
  "message": "Transfer history retrieved",
  "data": [
    {
      "_id": "661100aa22bb33cc44dd9910",
      "tokenId": "12345",
      "transferType": "mint",
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0xOldOwner...",
      "txHash": "0xabcdmint...",
      "transferAt": "2026-04-01T10:05:00.000Z"
    },
    {
      "_id": "661100aa22bb33cc44dd9911",
      "tokenId": "12345",
      "transferType": "transfer",
      "from": "0xOldOwner...",
      "to": "0xNewOwner...",
      "txHash": "0xfeedface...",
      "transferAt": "2026-04-04T11:12:00.000Z"
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
