const path = require("path");
const request = require("supertest");
const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env.test"),
});

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

const existingWallet =
  process.env.AUTH_TEST_EXISTING_WALLET ||
  "0x1234567890123456789012345678901234567809";
const otherWallet =
  process.env.AUTH_TEST_OTHER_WALLET ||
  "0x2345678901234567890123456789012345678901";
const newWallet =
  process.env.AUTH_TEST_NEW_WALLET ||
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const User = require("../../../backend/src/models/UserModel");
const app = require("../../../backend/src/app");

const makeAccessToken = ({ walletAddress, role = "user" }) => {
  return jwt.sign(
    {
      userId: "69c1480656dbeabb813aafc2",
      walletAddress,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
};

describe("User Endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleUser = {
    _id: "69c1480656dbeabb813aafc2",
    walletAddress: existingWallet.toLowerCase(),
    fullName: "User A",
    email: "user.a@example.com",
    phone: "0900000001",
    role: "user",
    isActive: true,
    notificationSettings: { email: true, push: true },
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    updatedAt: new Date("2026-03-01T10:00:00.000Z"),
    toObject: () => ({
      _id: "69c1480656dbeabb813aafc2",
      walletAddress: existingWallet.toLowerCase(),
      fullName: "User A",
      email: "user.a@example.com",
      phone: "0900000001",
      role: "user",
      isActive: true,
      notificationSettings: { email: true, push: true },
      __v: 0,
    }),
  };

  it("POST /api/users/auth should return 400 when sending extra fields", async () => {
    const res = await request(app).post("/api/users/auth").send({
      walletAddress: existingWallet,
      fullName: "Admin System",
      email: "admin@ewarranty.com",
      phone: "0901234567",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_VALIDATION");
    expect(res.body.error.message).toBe("Chỉ được gửi walletAddress");
  });

  it("POST /api/users/auth should return 200 for existing wallet login", async () => {
    vi.spyOn(User, "findOne").mockResolvedValueOnce(sampleUser);

    const res = await request(app).post("/api/users/auth").send({
      walletAddress: existingWallet,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Đăng nhập thành công");
    expect(res.body.data.user.walletAddress).toBe(existingWallet.toLowerCase());
    expect(res.body.data.user.__v).toBeUndefined();
    expect(typeof res.body.data.accessToken).toBe("string");
    expect(res.body.data.accessToken.length).toBeGreaterThan(0);
  });

  it("POST /api/users/auth should return 201 for new wallet register", async () => {
    vi.spyOn(User, "findOne").mockResolvedValueOnce(null);
    vi.spyOn(User.prototype, "save").mockResolvedValueOnce(undefined);

    const res = await request(app).post("/api/users/auth").send({
      walletAddress: newWallet,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Đăng ký tài khoản thành công");
    expect(res.body.data.user.walletAddress).toBe(newWallet.toLowerCase());
    expect(res.body.data.user.role).toBe("user");
    expect(typeof res.body.data.accessToken).toBe("string");
    expect(res.body.data.accessToken.length).toBeGreaterThan(0);
  });

  it("GET /api/users/me should return 401 when missing bearer token", async () => {
    const res = await request(app).get("/api/users/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
    expect(res.body.error.message).toBe("Thiếu Bearer token");
  });

  it("GET /api/users/me should return 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer invalid.token.value");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
    expect(res.body.error.message).toBe("Token không hợp lệ hoặc đã hết hạn");
  });

  it("GET /api/users/me should return 200 with user profile for matching wallet", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });
    vi.spyOn(User, "findOne").mockResolvedValueOnce(sampleUser);

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lấy thông tin người dùng thành công");
    expect(res.body.data.walletAddress).toBe(existingWallet.toLowerCase());
  });

  it("GET /api/users/me should return 404 when wallet does not exist", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });
    vi.spyOn(User, "findOne").mockResolvedValueOnce(null);

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E404_NOT_FOUND");
    expect(res.body.error.message).toBe("Không tìm thấy người dùng");
  });

  it("PUT /api/users/me should update one or many profile fields", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });
    vi.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce({
      ...sampleUser,
      fullName: "Nguyen Van A",
      phone: "0909123456",
      updatedAt: new Date("2026-03-29T10:00:00.000Z"),
    });

    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullname: "Nguyen Van A",
        phone: "0909123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe("Nguyen Van A");
    expect(res.body.data.phone).toBe("0909123456");
  });

  it("PUT /api/users/me should block privilege escalation fields", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });

    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_VALIDATION");
  });

  it("PUT /api/users/:walletAddress should allow staff to update profile fields", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "staff" });
    vi.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce({
      ...sampleUser,
      fullName: "Updated By Staff",
    });

    const res = await request(app)
      .put(`/api/users/${existingWallet}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Updated By Staff" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe("Updated By Staff");
  });

  it("PUT /api/users/:walletAddress should reject role updates", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "technician" });

    const res = await request(app)
      .put(`/api/users/${existingWallet}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_VALIDATION");
  });

  it("PATCH /api/users/:walletAddress/role should allow admin", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "admin" });
    vi.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce({
      ...sampleUser,
      role: "technician",
    });

    const res = await request(app)
      .patch(`/api/users/${existingWallet}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "technician" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("technician");
  });

  it("PATCH /api/users/:walletAddress/role should forbid non-admin", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "staff" });

    const res = await request(app)
      .patch(`/api/users/${existingWallet}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "technician" });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("PATCH /api/users/:walletAddress/is-active should allow user to update self", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "user" });
    vi.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce({
      ...sampleUser,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/users/${existingWallet}/is-active`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });

  it("PATCH /api/users/:walletAddress/is-active should reject user updating others", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "user" });

    const res = await request(app)
      .patch(`/api/users/${otherWallet}/is-active`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("PATCH /api/users/:walletAddress/is-active should allow staff to update others", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "staff" });
    vi.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce({
      ...sampleUser,
      walletAddress: otherWallet.toLowerCase(),
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/users/${otherWallet}/is-active`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.walletAddress).toBe(otherWallet.toLowerCase());
  });

  it("GET /api/users should allow privileged roles", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "technician" });
    vi.spyOn(User, "find").mockResolvedValueOnce([sampleUser]);

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].role).toBe("user");
  });

  it("GET /api/users/:walletAddress should return single user for staff", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase(), role: "staff" });
    vi.spyOn(User, "findOne").mockResolvedValueOnce(sampleUser);

    const res = await request(app)
      .get(`/api/users/${existingWallet}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.walletAddress).toBe(existingWallet.toLowerCase());
  });
});
