# API Contract - Repair Logs

Ngay cap nhat: 2026-04-17 (Refactored)

## 1) Data model dung cho FE

RepairLog object:

```json
{
  "id": "661100aa22bb33cc44dd8811",
  "warrantyId": "661100aa22bb33cc44dd7711",
  "serialNumber": "SN-7K2M-2024-X9",
  "technicianWallet": "0xTechnicianWallet...",
  "repairContent": "Thay pin và vệ sinh máy",
  "isWarrantyCovered": true,
  "status": "done",
  "cost": 0,
  "repairDate": "2026-04-03T09:30:00.000Z",
  "createdAt": "2026-04-03T09:30:00.000Z",
  "updatedAt": "2026-04-03T09:30:00.000Z"
}
```

## 2) Endpoints

### 2.1 POST /api/repair-logs (Technician, Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request Body:

```json
{
  "serialNumber": "SN-7K2M-2024-X9",
  "repairContent": "Thay màn hình chính hãng",
  "isWarrantyCovered": true,
  "status": "in_progress",
  "cost": 0
}
```

Success 201:

```json
{
  "success": true,
  "message": "Tạo nhật ký sửa chữa thành công",
  "data": {
    "id": "661100aa22bb33cc44dd8811",
    "serialNumber": "SN-7K2M-2024-X9",
    "repairContent": "Thay màn hình chính hãng",
    "isWarrantyCovered": true,
    "status": "in_progress",
    "cost": 0,
    "technicianWallet": "0xTechnicianWallet..."
  }
}
```

### 2.2 GET /api/repair-logs/device/:serialNumber (Public)

Muc dich:
- Khach hang tra cuu lich su sua chua cua thiet bi.

Success 200:

```json
{
  "success": true,
  "message": "Lấy lịch sử sửa chữa thành công",
  "data": [
    {
      "id": "661100aa22bb33cc44dd8811",
      "serialNumber": "SN-7K2M-2024-X9",
      "repairContent": "Thay pin",
      "status": "done",
      "repairDate": "2026-04-03T09:30:00.000Z"
    }
  ]
}
```

### 2.3 PATCH /api/repair-logs/:id (Technician, Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "repairContent": "Đã thay pin xong, đang sạc thử",
  "status": "done"
}
```

Success 200:

```json
{
  "success": true,
  "message": "Cập nhật nhật ký sửa chữa thành công",
  "data": {
    "id": "661100aa22bb33cc44dd8811",
    "repairContent": "Đã thay pin xong, đang sạc thử",
    "status": "done",
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
