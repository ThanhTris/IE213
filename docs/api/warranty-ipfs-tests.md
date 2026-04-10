# Hướng dẫn Kiểm thử và Tích hợp API Warranty (Web3 & IPFS Flow)

Tài liệu này cung cấp các kịch bản kiểm thử (Testcases) cho luồng tạo và cấu hình thẻ bảo hành điện tử lai Web2 & Web3, đặc biệt tập trung vào tích hợp IPFS tự động tại Backend.

## Dành cho Frontend (FE Team)

Quy trình chuẩn cho Frontend thực hiện chức năng Mint Thẻ Bảo Hành:
1. **Bước 1:** Gọi API `POST /api/warranties` với thông tin sản phẩm và khách hàng.
2. **Bước 2:** Lấy `tokenURI` từ kết quả trả về của Bước 1.
3. **Bước 3:** Gọi hàm `mint(address to, string tokenURI)` trên Smart Contract thông qua trình duyệt (MetaMask) bằng Ethers.js hoặc Web3.js.
4. **Bước 4:** Lắng nghe giao dịch thành công để lấy `txHash` và `tokenId` từ Blockchain.
5. **Bước 5:** Gọi API `PATCH /api/warranties/:id` gửi `tokenId` và `txHash` để thông báo cho Backend hoàn tất quá trình mint.

---

## Testcase 1: Khởi tạo Thẻ bảo hành nháp (Tự động tải lên IPFS)

**Mô tả:** Backend sẽ tiếp nhận thông tin thẻ bảo hành, tự động gộp thành JSON, gọi Pinata API để tải lên mạng IPFS, nhận lại `tokenURI` chuẩn và lưu xuống MongoDB.

- **Endpoint:** `POST /api/warranties`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <ADMIN_OR_STAFF_TOKEN>`
- **Body (JSON):**
```json
{
  "serialNumber": "SN-MACBOOK-TEST-001",
  "productCode": "MAC-M3-PRO",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "warrantyMonths": 24
}
```
- **Kết quả mong đợi (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Tạo phiếu bảo hành Pre-mint thành công",
  "data": {
    "serialNumber": "SN-MACBOOK-TEST-001",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "productCode": "MAC-M3-PRO",
    "tokenURI": "ipfs://QmYourIpfsHashFromPinata...",
    "status": true,
    "id": "60d5ecb8b392d7001f3e43a9"
  }
}
```
*(Ghi chú: Giữ lại giá trị `id` để dùng cho Testcase 2)*

---

## Testcase 2: Điền thông tin Blockchain sau khi Mint thành công

**Mô tả:** Sau khi Frontend lấy được `tokenURI` từ Testcase 1, đem gọi web3 mint() trên Blockchain thành công sẽ nhận được Transaction Hash và Token ID. Gửi 2 thông số đó xuống API này để Backend dán tem "Đã hoàn thành".

- **Endpoint:** `PATCH /api/warranties/:id` (Thay `:id` bằng id lấy từ Testcase 1)
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <ADMIN_OR_STAFF_TOKEN>`
- **Body (JSON):**
```json
{
  "tokenId": "999",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```
- **Kết quả mong đợi (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật mint và tạo lịch sử chuyển nhượng (mint) thành công",
  "data": {
    "id": "60d5ecb8b392d7001f3e43a9",
    "tokenId": "999",
    "mintTxHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "tokenURI": "ipfs://QmYourIpfsHashFromPinata...",
    "mintedAt": "2026-04-10T15:00:00.000Z",
    "status": true
  }
}
```

---

## Testcase 3: Khách hàng / Hệ thống tra cứu Thẻ Bảo Hành (Public)

**Mô tả:** API dùng để lấy thông tin chi tiết một thẻ bảo hành dựa vào số Serial Number, không yêu cầu xác thực. Sẽ trả về toàn bộ thông tin gốc, IPFS link và TX Hash minh bạch trên Blockchain.

- **Endpoint:** `GET /api/warranties/verify/:serialNumber` (Ví dụ: `/api/warranties/verify/SN-MACBOOK-TEST-001`)
- **Headers:** Không yêu cầu
- **Body:** Không yêu cầu
- **Kết quả mong đợi (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Tra cứu bảo hành thành công",
  "data": {
    "serialNumber": "SN-MACBOOK-TEST-001",
    "ownerAddress": "0x1234...7890",
    "productCode": "MAC-M3-PRO",
    "tokenId": "999",
    "tokenURI": "ipfs://QmYourIpfsHashFromPinata...",
    "mintTxHash": "0xabcdef...",
    "isMinted": true,
    "status": true
  }
}
```
