# 🧠 GEMINI.md — Quy tắc làm việc cho dự án IE213 (E-Warranty)

> File này định nghĩa các quy tắc bắt buộc, workflow, và skills được áp dụng cho toàn bộ dự án.
> Nguồn skills: https://github.com/sickn33/antigravity-awesome-skills
>
> **Skills đã tích hợp**: `concise-planning` · `git-pr-workflows-git-workflow` · `nodejs-best-practices` · `frontend-dev-guidelines` · `frontend-api-integration-patterns` · `cc-skill-frontend-patterns` · `e2e-testing-patterns`

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
- Viết plan theo cấu trúc chuẩn (xem template bên dưới) bằng công cụ tạo **Artifact** (không tạo file vật lý trừ khi được yêu cầu).
- Liệt kê rõ file nào sẽ thay đổi.
- Đặt tối đa 3–5 câu hỏi nếu còn mơ hồ.
- **DỪNG LẠI, chờ user duyệt TRỰC TIẾP TRÊN ARTIFACT**.
- **Lưu ý quan trọng**: Việc xác nhận và trao đổi về kế hoạch phải được thực hiện thông qua tính năng comment/approve của **Artifact Implementation Plan**, không xác nhận bằng tin nhắn chat thông thường.

**Bước 4 — Chờ xác nhận**
- Không bắt đầu code khi chưa được user xác nhận trên Artifact.
- Nếu user sửa plan → cập nhật lại nội dung Artifact và chờ xác nhận lần nữa.

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

## 🎨 SKILL 4: Frontend Development Guidelines

> Tích hợp từ skills: `frontend-dev-guidelines` · `frontend-api-integration-patterns` · `cc-skill-frontend-patterns`

### Stack FE của dự án:
- **Framework**: React + Vite
- **Style**: CSS thuần (không dùng Tailwind trừ khi được yêu cầu)
- **State**: React hooks (`useState`, `useEffect`, `useContext`)
- **API calls**: Axios với token JWT trong header
- **Routing**: React Router DOM

### Nguyên tắc bắt buộc khi viết FE:

#### 1. Tổ chức Component
- **Composition over inheritance**: Chia nhỏ component, tránh component quá lớn
- Component tái sử dụng → để trong `components/`
- Page-specific logic → để trong `pages/`
- Không được hard-code API URL — luôn dùng biến môi trường hoặc file config

#### 2. Gọi API chuẩn (từ skill `frontend-api-integration-patterns`)
```js
// ✅ ĐÚNG: Tách API layer riêng
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor tự động gắn token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### 3. Xử lý loading / error state
```jsx
// ✅ ĐÚNG: Luôn xử lý 3 trạng thái
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
return <DataComponent data={data} />;
```

#### 4. Performance
- Dùng `React.memo` cho component render nhiều lần
- Dùng `useCallback` cho handler function truyền vào props
- Lazy load route với `React.lazy` + `Suspense`
- Không gọi API trong vòng lặp

#### 5. Quy tắc đặt tên
- Component: PascalCase (`RepairTimeline.jsx`)
- Hook tự tạo: camelCase bắt đầu bằng `use` (`useRepairLogs.js`)
- File CSS: tên giống component (`RepairTimeline.css`)
- Constant: UPPER_SNAKE_CASE

#### 6. Cấu trúc thư mục FE
```
frontend/src/
├── pages/
│   ├── admin/       ← Trang dành cho Admin
│   └── user/        ← Trang dành cho User
├── components/      ← Component dùng chung
├── assets/
│   ├── views/       ← File CSS của từng trang
│   └── images/
├── hooks/           ← Custom hooks (nếu cần)
├── services/        ← API client & service functions
└── utils/           ← Hàm tiện ích
```

---

## 🧪 SKILL 5: Testing Guidelines

> Tích hợp từ skill `e2e-testing-patterns` của antigravity-awesome-skills

### Chiến lược kiểm thử cho dự án:

| Loại test | Tool | Phạm vi |
|---|---|---|
| **Unit test BE** | Jest (Node.js) | Controller logic, validator, utility functions |
| **Integration test** | Supertest + Jest | API endpoints end-to-end |
| **E2E test FE** | Playwright / Cypress | Luồng người dùng quan trọng |

### Các luồng E2E quan trọng cần test:
1. **Đăng nhập** bằng wallet address → nhận JWT token
2. **Tra cứu bảo hành** theo serialNumber
3. **Tạo phiếu sửa chữa** → xem timeline
4. **Cập nhật trạng thái** sửa chữa → push timeline
5. **Admin quản lý** sản phẩm, người dùng

### Quy tắc khi viết test:
- ❌ **KHÔNG** test trực tiếp production database
- ✅ Dùng dữ liệu test riêng biệt (mock hoặc DB test)
- ✅ Mỗi test case phải **độc lập** (không phụ thuộc thứ tự chạy)
- ✅ Đặt tên test theo format: `should <hành động> when <điều kiện>`
- ✅ Luôn test cả **happy path** và **error path**

### Pattern test API (Supertest):
```js
describe('POST /api/repair-logs', () => {
  it('should create repair log when valid data provided', async () => {
    const res = await request(app)
      .post('/api/repair-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ serialNumber: 'W01-...', isWarrantyCovered: true });
    expect(res.status).toBe(201);
    expect(res.body.data.timeline).toHaveLength(1);
    expect(res.body.data.timeline[0].status).toBe('pending');
  });
});
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
