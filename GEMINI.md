# 🧠 GEMINI.md — Quy tắc làm việc cho dự án IE213 (E-Warranty)

> File này định nghĩa các quy tắc bắt buộc, workflow, và skills được áp dụng cho toàn bộ dự án.
> Nguồn skills: https://github.com/sickn33/antigravity-awesome-skills

---

## 📋 Thông tin dự án

- **Tên dự án**: E-Warranty — Hệ thống bảo hành điện tử trên Blockchain
- **Stack chính**: Node.js / Express / Mongoose (Backend) · React / Vite (Frontend) · MongoDB Atlas · Solidity / Web3
- **Ngôn ngữ giao tiếp**: Tiếng Việt (bắt buộc)
- **Nhánh chính**: `feature/integrate-api`
- **Nhánh dữ liệu**: `database` (chứa file JSON backup — KHÔNG merge vào nhánh chính)

---

## 🔧 SKILL 1: Coding Workflow (Bắt buộc khi nhận yêu cầu code)

> Tích hợp từ skill `concise-planning` của antigravity-awesome-skills

### Quy trình 6 bước — BẮT BUỘC theo đúng thứ tự:

**Bước 1 — Đọc hiểu code hiện tại**
- Đọc các file liên quan đến yêu cầu
- Xác định các dependency, pattern đang dùng
- Kiểm tra KI (Knowledge Items) xem có context liên quan không

**Bước 2 — Đọc hiểu yêu cầu**
- Phân tích kỹ yêu cầu của user
- Xác định phạm vi công việc (In/Out scope)

**Bước 3 — Tạo Plan (artifact) + Câu hỏi làm rõ**
- Viết plan theo cấu trúc chuẩn (xem template bên dưới)
- Liệt kê rõ file nào sẽ thay đổi
- Đặt tối đa 3–5 câu hỏi nếu còn mơ hồ
- **DỪNG LẠI, chờ user duyệt**

**Bước 4 — Chờ xác nhận**
- Không bắt đầu code khi chưa được user xác nhận
- Nếu user sửa plan → cập nhật lại và xác nhận lần nữa

**Bước 5 — Tiến hành code**
- Thực hiện từng bước trong plan
- Báo cáo ngắn sau mỗi file hoàn thành

**Bước 6 — Kiểm tra & Báo cáo**
- Test logic hoặc chạy lệnh verify
- Tóm tắt những gì đã làm

### Plan Template chuẩn:
```markdown
## 🎯 Mục tiêu
<Mô tả ngắn gọn>

## 📂 Phạm vi thay đổi
| File | Hành động | Mô tả |
|---|---|---|
| path/to/file | Tạo mới / Chỉnh sửa | ... |

## 📋 Các bước thực hiện
1. ...
2. ...

## ⚠️ Rủi ro / Lưu ý
- ...

## ❓ Câu hỏi cần làm rõ (nếu có)
1. ...
```

### Quy tắc cứng:
- ❌ **KHÔNG** code trước khi plan được duyệt
- ✅ **LUÔN** viết plan bằng tiếng Việt
- ✅ **LUÔN** liệt kê file sẽ thay đổi trong plan
- ✅ Hỏi tối đa 3–5 câu, không hỏi linh tinh

---

## 📦 SKILL 2: Git Commit Workflow (Bắt buộc khi commit)

> Tích hợp từ skill `git-pr-workflows-git-workflow` của antigravity-awesome-skills

### Quy trình commit chuẩn:

**Bước 1** — Phân tích thay đổi: `git status`, `git diff --stat`
**Bước 2** — Đọc lại lịch sử hội thoại để hiểu context
**Bước 3** — Phân nhóm thay đổi theo logic (1 nhóm = 1 commit)
**Bước 4** — Trình bày kế hoạch commit cho user duyệt
**Bước 5** — Chờ xác nhận, sau đó commit từng bước

### Chuẩn Conventional Commits:
```
<type>(<scope>): <mô tả ngắn tiếng Anh>
```

| Type | Khi nào dùng |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Tái cấu trúc code |
| `style` | Thay đổi UI/CSS |
| `data` | Cập nhật dữ liệu/database |
| `chore` | Cấu hình, công việc phụ |
| `docs` | Tài liệu |
| `test` | Thêm/sửa test |

### Quy tắc cứng:
- ❌ **KHÔNG** commit tất cả 1 lần (no `git add .` rồi commit duy nhất)
- ✅ Mỗi commit = 1 mục đích logic rõ ràng
- ✅ Thứ tự logic: `chore/config` → `models` → `controllers` → `routes` → `frontend` → `data`
- ✅ **LUÔN** trình bày plan commit cho user duyệt trước
- ✅ Push lên đúng nhánh đang làm việc

---

## 🏗️ SKILL 3: Node.js Backend Guidelines

> Tích hợp từ skill `nodejs-best-practices` của antigravity-awesome-skills

### Áp dụng cho project này:
- **Framework**: Express.js (đang dùng) — phù hợp với dự án hiện tại
- **Async**: luôn dùng `async/await`, không dùng callback
- **Error handling**: wrap trong try/catch, dùng `sendError()` từ `apiResponse.js`
- **Validation**: validate input trước khi query DB
- **Response chuẩn**: dùng `sendSuccess()` / `sendError()` từ utils
- **Mongoose**: dùng `.lean()` khi chỉ đọc data (performance)
- **Security**: không expose `__v`, sanitize input, lowercase wallet address

### Pattern chuẩn cho Controller:
```js
const action = async (req, res) => {
  try {
    // 1. Validate input
    // 2. Query DB
    // 3. Return sendSuccess / sendError
  } catch (error) {
    if (error?.name === 'ValidationError') { ... }
    return sendError(res, { statusCode: 500, errorCode: 'E500_INTERNAL', message: '...' });
  }
};
```

---

## 🗂️ Cấu trúc dự án quan trọng

```
IE213/
├── backend/
│   ├── src/
│   │   ├── controllers/   ← Logic xử lý API
│   │   ├── models/        ← Mongoose Schema
│   │   ├── routes/        ← Định nghĩa API endpoints
│   │   ├── middleware/    ← auth.js, errorHandler.js
│   │   ├── utils/         ← apiResponse.js
│   │   └── database/      ← JSON backup (KHÔNG sửa trực tiếp)
│   ├── export-data.js     ← Script đồng bộ DB → JSON
│   └── .env               ← Biến môi trường (không commit)
├── frontend/
│   └── src/
│       ├── pages/
│       └── components/
├── GEMINI.md              ← File này (rules)
└── .gitignore             ← Bao gồm .gemini/
```

---

## 🚫 Quy tắc tuyệt đối KHÔNG làm

1. **KHÔNG** sửa trực tiếp các file `backend/src/database/*.json` — chỉ được chạy `export-data.js`
2. **KHÔNG** commit file `.env` hoặc thông tin nhạy cảm
3. **KHÔNG** merge nhánh `database` vào `feature/integrate-api` (nhánh database chỉ để backup)
4. **KHÔNG** dùng `git add .` rồi commit 1 lần duy nhất
5. **KHÔNG** code khi chưa có plan được duyệt

---

## 💡 Context kỹ thuật quan trọng

- **Auth**: JWT token → `req.user.walletAddress`, `req.user.role`
- **DB collection names**: `product`, `warranties`, `repair_log`, `transfer_history`
- **Wallet address**: luôn lowercase, validate với regex `/^0x[a-f0-9]{40}$/`
- **RepairLog enum** (mới): `pending` → `waiting_parts` → `fixing` → `completed` → `delivered` / `cancelled`
- **Timeline**: push bằng `$push`, không replace toàn bộ mảng
- **Admin wallet**: `0x1c20a9c843c4a63d59c2970bf3b061616e8eae26`
- **Login API**: `POST /api/users/auth` body: `{ walletAddress }`
