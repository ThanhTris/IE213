# API Contract va Database Schema (Chuan FE + BE)

Ngay cap nhat: 2026-04-05
Phien ban contract: v1.0

Tai lieu nay la nguon su that duy nhat cho:

- Team Backend: dong bo schema MongoDB va quyen endpoint.
- Team Frontend: tich hop API theo dung request/response format.

## 1) Database Schema bat buoc (MongoDB)

He thong su dung chinh xac 5 collection sau.

### 1.1 users

- \_id: ObjectId
- walletAddress: String (required, unique, index)
- role: String (enum: guest, user, admin, staff, technician; default: user)
- nonce: String
- status: Boolean (default: true)
- createdAt: Date
- updatedAt: Date

Index khuyen nghi:

- unique index cho walletAddress

### 1.2 products

- \_id: ObjectId
- productCode: String (required, unique, index)
- name: String (required)
- description: String
- warrantyMonths: Number (required)
- isActive: Boolean (default: true)
- createdAt: Date
- updatedAt: Date

Index khuyen nghi:

- unique index cho productCode

### 1.3 warranties

- \_id: ObjectId
- serialNumber: String (required, unique, index)
- serialHash: String (required)
- productModel: String (required; map voi products.productCode)
- ownerAddress: String (required)
- tokenId: String (default: "")
- txHash: String (default: "")
- status: String (enum: pending, active, revoked; default: pending)
- soldAt: Date
- mintedAt: Date
- notes: String
- createdBy: String (wallet cua staff/admin tao ban ghi)
- createdAt: Date
- updatedAt: Date

Index khuyen nghi:

- unique index cho serialNumber
- index ket hop cho ownerAddress + status
- index cho tokenId

### 1.4 repair_logs

- \_id: ObjectId
- warrantyId: ObjectId (ref warranties.\_id)
- serialNumber: String
- tokenId: String
- description: String (required)
- parts: [String]
- cost: Number (default: 0)
- performedAt: Date
- createdBy: String (wallet cua technician/admin)
- createdAt: Date
- updatedAt: Date

Index khuyen nghi:

- index cho warrantyId
- index cho serialNumber
- index cho tokenId

### 1.5 transfer_histories

- \_id: ObjectId
- warrantyId: ObjectId (ref warranties.\_id)
- tokenId: String
- transferType: String (enum: mint, transfer)
- from: String
- to: String
- txHash: String (required)
- transferAt: Date
- createdAt: Date
- updatedAt: Date

Index khuyen nghi:

- index cho tokenId
- unique index cho txHash
- index cho warrantyId + transferAt

## 2) Quy tac vang cho response

Tat ca API phai tra ve envelope chuan.

### 2.1 Success

```json
{
  "success": true,
  "message": "Noi dung thong bao (neu co)",
  "data": {}
}
```

### 2.2 Error

```json
{
  "success": false,
  "error": {
    "code": "E400_VALIDATION",
    "message": "Chi tiet loi",
    "details": []
  }
}
```

Error code baseline:

- E400_VALIDATION
- E401_UNAUTHORIZED
- E403_FORBIDDEN
- E404_NOT_FOUND
- E409_DUPLICATE
- E500_INTERNAL

## 3) Bang chi muc API cho Frontend

Luu y: API danh dau khoa yeu cau header
Authorization: Bearer <JWT_TOKEN>

| Domain   | Method | Endpoint                       | Quyen                | Muc dich FE                                      |
| -------- | ------ | ------------------------------ | -------------------- | ------------------------------------------------ |
| Auth     | POST   | /api/users/auth                | Public               | Dang nhap/dang ky bang walletAddress + signature |
| Auth     | GET    | /api/users/me                  | Authenticated        | Lay thong tin tai khoan dang dang nhap           |
| User     | PUT    | /api/users/:walletAddress      | Admin hoac chinh chu | Cap nhat profile / role / status theo chinh sach |
| User     | GET    | /api/users                     | Admin                | Lay danh sach user cho trang quan tri            |
| Product  | POST   | /api/products                  | Admin, Staff         | Tao model san pham moi                           |
| Product  | GET    | /api/products                  | Public               | Lay danh sach san pham                           |
| Product  | GET    | /api/products/:idOrCode        | Public               | Lay chi tiet 1 san pham                          |
| Product  | PUT    | /api/products/:idOrCode        | Admin, Staff         | Sua thong tin san pham                           |
| Product  | DELETE | /api/products/:idOrCode        | Admin                | Xoa mem san pham                                 |
| Warranty | POST   | /api/warranties                | Admin, Staff         | Pre-mint tao so bao hanh voi status pending      |
| Warranty | PATCH  | /api/warranties/:id            | Admin, Staff         | Post-mint cap nhat tokenId + txHash              |
| Warranty | GET    | /api/warranties/my-warranties  | User                 | Lay so bao hanh cua vi dang dang nhap            |
| Warranty | PATCH  | /api/warranties/:id/status     | Admin                | Cap nhat nhanh trang thai bao hanh               |
| Repair   | POST   | /api/repair-logs               | Technician, Admin    | Tao log sua chua                                 |
| Repair   | GET    | /api/repair-logs/:serialNumber | Public               | Tra cuu lich su sua chua theo serial             |
| Repair   | PATCH  | /api/repair-logs/:id           | Technician, Admin    | Sua log (technician chi sua log do minh tao)     |
| Transfer | POST   | /api/transfers                 | User                 | Bao cao giao dich chuyen nhuong thanh cong       |
| Transfer | GET    | /api/transfers/token/:tokenId  | Public               | Xem lich su chuyen nhuong theo tokenId           |

## 4) Chuan hoa phan quyen

- guest: truy cap endpoint public.
- user: endpoint cua user va transfer sau khi dang nhap.
- staff: tac vu van hanh product + warranty pre/post mint.
- technician: tao/sua repair log theo ownership.
- admin: toan quyen quan tri, bao gom user list, role/status, warranty status.

## 5) Quy tac tich hop FE

- FE su dung mot API wrapper chung (axios/fetch) cho toan bo request.
- FE phai inject Authorization header voi endpoint can quyen.
- FE parse response theo envelope success/error o muc 2.
- FE khong hardcode shape rieng tung endpoint ngoai truong data, message, error.

## 6) Mapping tai lieu chi tiet

- User va Product: xem docs/api/user-product.md
- Warranty: xem docs/api/warranties.md
- Repair Logs: xem docs/api/repair-logs.md
- Transfers: xem docs/api/transfers.md
- Health check: xem docs/api/health.md

## 7) Checklist doi chieu code (cap nhat theo code hien tai)

- [x] Envelope success/error da duoc dung chung qua backend/src/utils/apiResponse.js.
- [x] Da co route auth va cap JWT: POST /api/users/auth.
- [x] Da co transfer flow: POST /api/transfers, GET /api/transfers/token/:tokenId, GET /api/transfers/tx/:txHash.
- [x] Da co warranty verify public: GET /api/warranties/verify/:serialNumber.
- [ ] Chuan endpoint repair public theo bang API FE: GET /api/repair-logs/:serialNumber (code hien tai dang la /api/repair-logs/device/:serialNumber).
- [ ] Chuan role Product theo bang API FE (Admin/Staff cho create/update) - code hien tai dang chi Admin.
- [ ] Chuan role User list theo bang API FE (chi Admin) - code hien tai dang cho Admin/Staff/Technician.
- [ ] Chuan role Warranty status theo bang API FE (chi Admin) - code hien tai dang cho Admin/Staff.
- [ ] Chuan hoa field naming schema theo contract docs (status vs isActive, productModel vs productCode, txHash vs mintTxHash).
