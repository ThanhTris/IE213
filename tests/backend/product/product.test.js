const request = require("supertest");
const jwt = require("jsonwebtoken");
const path = require("path");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.PINATA_JWT = "mock-jwt";

const Product = require("../../../backend/src/models/ProductModel");
const app = require("../../../backend/src/app");

const makeAccessToken = ({ role = "user", walletAddress = "0xabc" } = {}) => {
  return jwt.sign(
    {
      userId: "69c1480656dbeabb813aafc2",
      walletAddress,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};

const mockProduct = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  productCode: "IP16-001",
  productName: "iPhone 16",
  brand: "Apple",
  color: "Black",
  config: "256GB, 12GB RAM",
  imageUrl: "ipfs://mock-cid",
  price: 29990000,
  warrantyMonths: 12,
  isActive: true,
  createdAt: "2026-03-24T01:56:02.768Z",
  updatedAt: "2026-03-24T01:56:02.768Z",
  ...overrides,
});

describe("Product Endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch for Pinata
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ IpfsHash: "mock-cid" }),
    });
  });

  it("GET /api/products should return 200 and only active products", async () => {
    const aggregateSpy = vi.spyOn(Product, "aggregate").mockResolvedValueOnce([
      mockProduct({ productCode: "IP16-001", isActive: true }),
      mockProduct({
        _id: "507f1f77bcf86cd799439012",
        productCode: "IP16-002",
        isActive: true,
      }),
    ]);

    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lấy danh sách sản phẩm thành công");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(aggregateSpy).toHaveBeenCalled();
  });

  it("GET /api/products?includeInactive=true should return 403 for anonymous", async () => {
    const res = await request(app).get("/api/products?includeInactive=true");

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("GET /api/products?includeInactive=true should return 200 for admin", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    const aggregateSpy = vi.spyOn(Product, "aggregate").mockResolvedValueOnce([
      mockProduct({ productCode: "IP16-001", isActive: true }),
      mockProduct({
        _id: "507f1f77bcf86cd799439013",
        productCode: "IP16-003",
        isActive: false,
      }),
    ]);

    const res = await request(app)
      .get("/api/products?includeInactive=true")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(aggregateSpy).toHaveBeenCalled();
  });

  it("GET /api/products/:idOrCode should return 200 when found", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValueOnce(mockProduct());

    const res = await request(app).get("/api/products/ip16-001");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lấy thông tin sản phẩm thành công");
    expect(res.body.data.productCode).toBe("IP16-001");
  });

  it("POST /api/products should return 403 when user is not admin", async () => {
    const userToken = makeAccessToken({ role: "user" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .field("productCode", "IP16-001")
      .field("productName", "iPhone 16")
      .field("brand", "Apple");

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/products should return 201 when admin creates product (multipart)", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    vi.spyOn(Product, "findOne").mockResolvedValueOnce(null);
    vi.spyOn(Product.prototype, "save").mockImplementationOnce(function save() {
      this.createdAt = "2026-03-24T01:56:02.768Z";
      return Promise.resolve(this);
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("productCode", "ip16-001")
      .field("productName", " iPhone 16 ")
      .field("brand", " Apple ")
      .field("color", "Black")
      .field("config", "256GB, 12GB RAM")
      .field("price", 29990000)
      .field("warrantyMonths", 12)
      .attach("image", Buffer.from("fake-image"), "test.jpg");

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tạo sản phẩm thành công");
    expect(res.body.data.productCode).toBe("IP16-001");
    expect(res.body.data.imageUrl).toBe("ipfs://mock-cid");
  });

  it("POST /api/products should return 400 when required fields are missing", async () => {
    const adminToken = makeAccessToken({ role: "admin" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("productCode", "")
      .field("productName", "iPhone 16");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_MISSING_FIELD");
  });

  it("PUT /api/products/:idOrCode should return 200 when update succeeds (multipart)", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    vi.spyOn(Product, "findOneAndUpdate").mockResolvedValueOnce(
      mockProduct({
        productName: "iPhone 16 Pro",
        updatedAt: "2026-03-24T02:05:00.000Z",
      }),
    );

    const res = await request(app)
      .put("/api/products/IP16-001")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("productName", "iPhone 16 Pro")
      .attach("image", Buffer.from("new-image"), "new.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Cập nhật sản phẩm thành công");
  });

  it("DELETE /api/products/:idOrCode should return 200 and soft delete product", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    const updateSpy = vi
      .spyOn(Product, "findOneAndUpdate")
      .mockResolvedValueOnce(mockProduct({ isActive: false }));

    const res = await request(app)
      .delete("/api/products/IP16-001")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });
});

