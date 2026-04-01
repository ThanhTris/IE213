# Transfers API (Mock Data)

## POST /api/transfers

- Description: Record a transfer event after an on-chain transfer transaction.
- Request example:

```
POST /api/transfers
Content-Type: application/json
{
  "warrantyId": "643a1f...",
  "tokenId": "1234",
  "from": "0xOldOwner...",
  "to": "0xNewOwner...",
  "txHash": "0xfeedface...",
  "transferAt": "2026-04-03T11:12:00Z"
}
```

- Response example:

```
201 Created
{
  "success": true,
  "message": "Transfer recorded",
  "data": {
    "_id": "645c3f...",
    "warrantyId": "643a1f...",
    "tokenId": "1234",
    "from": "0xOldOwner...",
    "to": "0xNewOwner...",
    "txHash": "0xfeedface...",
    "transferAt": "2026-04-03T11:12:00Z",
    "transferType": "transfer"
  }
}
```

## GET /api/transfers/:tokenId

- Response example:

```
200 OK
{
  "success": true,
  "message": "Transfers retrieved",
  "data": [
    {
      "_id": "645c3f...",
      "tokenId": "1234",
      "from": "0xOldOwner...",
      "to": "0xNewOwner...",
      "txHash": "0xfeedface...",
      "transferAt": "2026-04-03T11:12:00Z",
      "transferType": "transfer"
    }
  ]
}
```
