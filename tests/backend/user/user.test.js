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
    const existingUser = {
      _id: "507f1f77bcf86cd799439012",
      walletAddress: existingWallet.toLowerCase(),
      role: "user",
      fullName: "User A",
      email: "user.a@example.com",
      phone: "0900000001",
      toObject: () => ({
        _id: "507f1f77bcf86cd799439012",
        walletAddress: existingWallet.toLowerCase(),
        role: "user",
        fullName: "User A",
        email: "user.a@example.com",
        phone: "0900000001",
        __v: 0,
      }),
    };

    vi.spyOn(User, "findOne").mockResolvedValueOnce(existingUser);

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
    const res = await request(app)
      .get("/api/users/me")
      .query({ walletAddress: otherWallet });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
    expect(res.body.error.message).toBe("Thiếu Bearer token");
  });

  it("GET /api/users/me should return 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer invalid.token.value")
      .query({ walletAddress: otherWallet });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
    expect(res.body.error.message).toBe("Token không hợp lệ hoặc đã hết hạn");
  });

  it("GET /api/users/me should return 200 with user profile for matching wallet", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });
    vi.spyOn(User, "findOne").mockResolvedValueOnce({
      _id: "69c1480656dbeabb813aafc2",
      walletAddress: existingWallet.toLowerCase(),
      fullName: "Test User",
      email: "test.user@example.com",
      phone: "0909999999",
    });

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .query({ walletAddress: existingWallet });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lấy thông tin người dùng thành công");
    expect(res.body.data.walletAddress).toBe(existingWallet.toLowerCase());
  });

  it("GET /api/users/me should return 403 when user requests another wallet", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .query({ walletAddress: otherWallet });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
    expect(res.body.error.message).toBe("Bạn chỉ có thể xem hồ sơ của chính mình");
  });

  it("GET /api/users/me should return 404 when wallet does not exist", async () => {
    const token = makeAccessToken({ walletAddress: existingWallet.toLowerCase() });
    vi.spyOn(User, "findOne").mockResolvedValueOnce(null);

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .query({ walletAddress: existingWallet });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E404_NOT_FOUND");
    expect(res.body.error.message).toBe("Không tìm thấy người dùng");
  });
});
