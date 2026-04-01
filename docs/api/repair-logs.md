# Repair Logs API (Mock Data)

## POST /api/repair-logs

- Description: Technician or Admin creates a repair log. `createdBy` should be set to the performer's wallet/id.
- Request example:

```
POST /api/repair-logs
Content-Type: application/json
{
  "warrantyId": "643a1f...",
  "serialNumber": "SN-2026-0001",
  "description": "Replace motherboard",
  "parts": ["MB-XYZ-01"],
  "cost": 120.50,
  "performedAt": "2026-04-02T09:30:00Z",
  "createdBy": "technician_wallet_address"
}
```

- Response example:

```
201 Created
{
  "success": true,
  "message": "Repair log created",
  "data": {
    "_id": "644b2f...",
    "warrantyId": "643a1f...",
    "serialNumber": "SN-2026-0001",
    "description": "Replace motherboard",
    "parts": ["MB-XYZ-01"],
    "cost": 120.50,
    "performedAt": "2026-04-02T09:30:00Z",
    "createdBy": "technician_wallet_address",
    "createdAt": "2026-04-02T09:32:00Z"
  }
}
```

## PATCH /api/repair-logs/:id

- Description: Update a repair log. Policy: Technician may only update logs they created; Admin can update any log.
- Request example:

```
PATCH /api/repair-logs/644b2f...
Content-Type: application/json
{
  "description": "Replace motherboard and battery",
  "parts": ["MB-XYZ-01","BAT-100"],
  "cost": 150.00
}
```

- Response example:

```
200 OK
{
  "success": true,
  "message": "Repair log updated",
  "data": {
    "_id": "644b2f...",
    "description": "Replace motherboard and battery",
    "parts": ["MB-XYZ-01","BAT-100"],
    "cost": 150.00,
    "updatedBy": "technician_wallet_address_or_admin",
    "updatedAt": "2026-04-02T10:00:00Z"
  }
}
```

## GET /api/repair-logs/device/:serialNumber

- Response example:

```
200 OK
{
  "success": true,
  "message": "Repair logs retrieved",
  "data": [
    {
      "_id": "644b2f...",
      "serialNumber": "SN-2026-0001",
      "description": "Replace motherboard",
      "cost": 120.50,
      "performedAt": "2026-04-02T09:30:00Z",
      "createdBy": "technician_wallet_address"
    }
  ]
}
```
