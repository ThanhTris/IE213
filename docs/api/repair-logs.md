# API Contract - Repair Logs

Ngay cap nhat: 2026-04-05

## 1) Data model dung cho FE

RepairLog object:

```json
{
  "_id": "661100aa22bb33cc44dd8811",
  "warrantyId": "661100aa22bb33cc44dd7711",
  "serialNumber": "SN-7K2M-2024-X9",
  "tokenId": "12345",
  "description": "Replace battery and test charging",
  "parts": ["BAT-02"],
  "cost": 0,
  "performedAt": "2026-04-03T09:30:00.000Z",
  "createdBy": "0xTechnicianWallet...",
  "createdAt": "2026-04-03T09:30:00.000Z",
  "updatedAt": "2026-04-03T09:30:00.000Z"
}
```

## 2) Endpoints

### 2.1 POST /api/repair-logs (Technician, Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "warrantyId": "661100aa22bb33cc44dd7711",
  "serialNumber": "SN-7K2M-2024-X9",
  "tokenId": "12345",
  "description": "Replace battery and test charging",
  "parts": ["BAT-02"],
  "cost": 0,
  "performedAt": "2026-04-03T09:30:00.000Z"
}
```

Success 201:

```json
{
  "success": true,
  "message": "Repair log created",
  "data": {
    "_id": "661100aa22bb33cc44dd8811",
    "serialNumber": "SN-7K2M-2024-X9",
    "description": "Replace battery and test charging",
    "parts": ["BAT-02"],
    "cost": 0,
    "createdBy": "0xTechnicianWallet..."
  }
}
```

### 2.2 GET /api/repair-logs/:serialNumber (Public)

Muc dich:

- Khach vang lai tra cuu lich su sua chua theo serial.

Success 200:

```json
{
  "success": true,
  "message": "Repair logs retrieved",
  "data": [
    {
      "_id": "661100aa22bb33cc44dd8811",
      "serialNumber": "SN-7K2M-2024-X9",
      "description": "Replace battery and test charging",
      "parts": ["BAT-02"],
      "cost": 0,
      "performedAt": "2026-04-03T09:30:00.000Z"
    }
  ]
}
```

### 2.3 PATCH /api/repair-logs/:id (Technician, Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Quyen:

- Admin: sua moi log.
- Technician: chi sua log do chinh minh tao.

Request:

```json
{
  "description": "Replace battery, clean charging port",
  "parts": ["BAT-02", "PORT-CLEAN"],
  "cost": 10
}
```

Success 200:

```json
{
  "success": true,
  "message": "Repair log updated",
  "data": {
    "_id": "661100aa22bb33cc44dd8811",
    "description": "Replace battery, clean charging port",
    "parts": ["BAT-02", "PORT-CLEAN"],
    "cost": 10,
    "updatedAt": "2026-04-05T12:10:00.000Z"
  }
}
```

## 3) Error mau

```json
{
  "success": false,
  "error": {
    "code": "E403_FORBIDDEN",
    "message": "Technician can only update own repair logs",
    "details": []
  }
}
```
