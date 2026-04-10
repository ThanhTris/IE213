# API Contract - User va Product (FE Integration)

Ngay cap nhat: 2026-04-05

## 1) Response envelope (bat buoc)

### Success

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "E400_VALIDATION",
    "message": "...",
    "details": []
  }
}
```

## 2) User APIs

### 2.1 POST /api/users/auth (Public)

Muc dich:

- FE gui walletAddress + signature Web3 de dang nhap/dang ky.

Request:

```json
{
  "walletAddress": "0x1234...abcd",
  "signature": "0x...",
  "nonce": "login_nonce_from_server",
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0909000999"
}
```

Success 200:

```json
{
  "success": true,
  "message": "User authenticated",
  "data": {
    "user": {
      "_id": "661100aa22bb33cc44dd55ee",
      "walletAddress": "0x1234...abcd",
      "role": "user",
      "status": true,
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    },
    "token": "<JWT_TOKEN>"
  }
}
```

### 2.2 GET /api/users/me (Authenticated)

Header:

- Authorization: Bearer <JWT_TOKEN>

Success 200:

```json
{
  "success": true,
  "message": "Current user",
  "data": {
    "_id": "661100aa22bb33cc44dd55ee",
    "walletAddress": "0x1234...abcd",
    "role": "user",
    "status": true,
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z"
  }
}
```

### 2.3 PUT /api/users/:walletAddress (Admin hoac chinh chu)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "email": "new@example.com",
  "phone": "0909888777",
  "role": "staff",
  "status": false
}
```

Ghi chu quyen:

- Chinh chu: duoc sua thong tin profile co ban.
- Admin: duoc sua role va status.

Success 200:

```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "_id": "661100aa22bb33cc44dd55ee",
    "walletAddress": "0x1234...abcd",
    "role": "staff",
    "status": false,
    "updatedAt": "2026-04-05T11:00:00.000Z"
  }
}
```

### 2.4 GET /api/users (Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Success 200:

```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "_id": "661100aa22bb33cc44dd55ee",
      "walletAddress": "0x1234...abcd",
      "role": "user",
      "status": true
    },
    {
      "_id": "661100aa22bb33cc44dd55ff",
      "walletAddress": "0xabcd...1234",
      "role": "technician",
      "status": true
    }
  ]
}
```

## 3) Product APIs

### 3.1 POST /api/products (Admin, Staff)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "productCode": "IP15-PRO-256",
  "name": "iPhone 15 Pro 256GB",
  "description": "Titanium, A17 Pro",
  "warrantyMonths": 12
}
```

Success 201:

```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "_id": "661100aa22bb33cc44dd6611",
    "productCode": "IP15-PRO-256",
    "name": "iPhone 15 Pro 256GB",
    "description": "Titanium, A17 Pro",
    "warrantyMonths": 12,
    "isActive": true,
    "createdAt": "2026-04-05T10:20:00.000Z",
    "updatedAt": "2026-04-05T10:20:00.000Z"
  }
}
```

### 3.2 GET /api/products (Public)

Success 200:

```json
{
  "success": true,
  "message": "Products retrieved",
  "data": [
    {
      "_id": "661100aa22bb33cc44dd6611",
      "productCode": "IP15-PRO-256",
      "name": "iPhone 15 Pro 256GB",
      "description": "Titanium, A17 Pro",
      "warrantyMonths": 12,
      "isActive": true
    }
  ]
}
```

### 3.3 GET /api/products/:idOrCode (Public)

Success 200:

```json
{
  "success": true,
  "message": "Product found",
  "data": {
    "_id": "661100aa22bb33cc44dd6611",
    "productCode": "IP15-PRO-256",
    "name": "iPhone 15 Pro 256GB",
    "description": "Titanium, A17 Pro",
    "warrantyMonths": 12,
    "isActive": true
  }
}
```

### 3.4 PUT /api/products/:idOrCode (Admin, Staff)

Header:

- Authorization: Bearer <JWT_TOKEN>

Request:

```json
{
  "name": "iPhone 15 Pro 256GB (VN/A)",
  "warrantyMonths": 18
}
```

Success 200:

```json
{
  "success": true,
  "message": "Product updated",
  "data": {
    "_id": "661100aa22bb33cc44dd6611",
    "productCode": "IP15-PRO-256",
    "name": "iPhone 15 Pro 256GB (VN/A)",
    "warrantyMonths": 18,
    "updatedAt": "2026-04-05T11:30:00.000Z"
  }
}
```

### 3.5 DELETE /api/products/:idOrCode (Admin)

Header:

- Authorization: Bearer <JWT_TOKEN>

Success 200:

```json
{
  "success": true,
  "message": "Product deactivated",
  "data": {
    "_id": "661100aa22bb33cc44dd6611",
    "productCode": "IP15-PRO-256",
    "isActive": false,
    "updatedAt": "2026-04-05T11:40:00.000Z"
  }
}
```

## 4) FE implementation checklist

- Tao userApi va productApi trong mot file wrapper chung.
- Tu dong them Authorization header neu co token.
- Xu ly loi theo error.code thay vi hardcode text loi.
- Khong bind UI truc tiep vao field ngoai envelope.
