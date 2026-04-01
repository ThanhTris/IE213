# Warranties API (Mock Data)

## POST /api/warranties (Pre-mint)

- Description: Staff creates a pending warranty record off-chain. Backend stores status `pending`.
- Request example:

```
POST /api/warranties
Content-Type: application/json
{
  "serialNumber": "SN-2026-0001",
  "productModel": "Model X",
  "ownerAddress": "0xA1b2C3d4E5f6...",
  "soldAt": "2026-04-01T10:00:00Z",
  "notes": "Sold at Store A",
  "status": "pending"
}
```

- Response example:

```
201 Created
{
  "success": true,
  "message": "Warranty created",
  "data": {
    "_id": "643a1f...",
    "serialNumber": "SN-2026-0001",
    "serialHash": "0xabc123...",
    "productModel": "Model X",
    "ownerAddress": "0xA1b2...",
    "status": "pending",
    "createdBy": "staff_wallet_address",
    "createdAt": "2026-04-01T10:00:00Z"
  }
}
```

## PATCH /api/warranties/:id (Attach on-chain proof after mint)

- Description: Called after mint transaction to attach `txHash` and `tokenId`.
- Request example:

```
PATCH /api/warranties/643a1f...
Content-Type: application/json
{
  "txHash": "0xdeadbeef...",
  "tokenId": "1234"
}
```

- Response example:

```
200 OK
{
  "success": true,
  "message": "Warranty updated with mint info",
  "data": {
    "_id": "643a1f...",
    "tokenId": "1234",
    "txHash": "0xdeadbeef...",
    "status": "active",
    "mintedAt": "2026-04-01T10:05:00Z"
  }
}
```

## GET /api/warranties/verify/:serialNumber

- Description: Public lookup by serial. Backend hashes serial and finds warranty. `ownerAddress` is masked for public views.
- Response example:

```
200 OK
{
  "success": true,
  "message": "Warranty found",
  "data": {
    "serialNumber": "SN-2026-0001",
    "productModel": "Model X",
    "warrantyStatus": "active",
    "issuedAt": "2026-04-01",
    "ownerAddress": "0xA1b2...9fF3"  // masked: 0xA1b2...9fF3
  }
}
```

## GET /api/warranties

- Description: Admin endpoint — list warranties with pagination and filters (status, productModel).
- Request example:

```
GET /api/warranties?page=1&limit=20&status=active
Authorization: Bearer <jwt>
```

- Response example:

```
200 OK
{
  "success": true,
  "message": "Warranties retrieved",
  "data": {
    "items": [
      {
        "_id": "643a1f...",
        "serialNumber": "SN-2026-0001",
        "productModel": "Model X",
        "tokenId": "1234",
        "status": "active",
        "ownerAddress": "0xA1b2...9fF3"
      }
    ],
    "meta": {"page":1,"limit":20,"total":100}
  }
}
```

## GET /api/warranties/:id

```
GET /api/warranties/643a1f...
Authorization: Bearer <jwt>
```

```
200 OK
{
  "success": true,
  "message": "Warranty detail",
  "data": {
    "_id": "643a1f...",
    "serialNumber": "SN-2026-0001",
    "serialHash": "0xabc123...",
    "productModel": "Model X",
    "tokenId": "1234",
    "txHash": "0xdeadbeef...",
    "status": "active",
    "ownerAddress": "0xA1b2...9fF3",
    "mintedAt": "2026-04-01T10:05:00Z"
  }
}
```

Placeholder for future updates or changes
This section may be updated to include additional details or examples.

## Error example (standard envelope)

```
401 Unauthorized
{
  "success": false,
  "error": {
    "code": "E401_UNAUTHORIZED",
    "message": "Authorization token missing or invalid",
    "details": []
  }
}
```

## GET /api/warranties/my-warranties

- Description: Authenticated user retrieves warranties owned by their connected wallet.
- Request example:

```
GET /api/warranties/my-warranties
Authorization: Bearer <jwt>
```

- Response example:

```
200 OK
{
  "success": true,
  "message": "My warranties retrieved",
  "data": [
    {
      "_id": "643a1f...",
      "serialNumber": "SN-2026-0001",
      "productModel": "Model X",
      "tokenId": "1234",
      "status": "active"
    }
  ]
}
```

## PATCH /api/warranties/:id/status

- Description: Update warranty status (e.g., revoke, reactivate). Admin/Staff only.
- Request example:

```
PATCH /api/warranties/643a1f.../status
Authorization: Bearer <jwt>
{
  "status": "revoked",
  "reason": "Policy violation"
}
```

- Response example:

```
200 OK
{
  "success": true,
  "message": "Warranty status updated",
  "data": {
    "_id": "643a1f...",
    "status": "revoked",
    "updatedAt": "2026-04-01T11:00:00Z"
  }
}
```
