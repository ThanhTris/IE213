const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

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
  model: "A18",
  color: "Black",
  configuration: "256GB, 12GB RAM",
  specifications: {
    ram: "12GB",
    storage: "256GB",
    processor: "A18",
    screenSize: "6.1 inch",
  },
  imageUrl: "https://example.com/iphone16.jpg",
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
  });

  it("GET /api/products should return 200 and only active products", async () => {
    const findSpy = vi.spyOn(Product, "find").mockResolvedValueOnce([
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
    expect(findSpy).toHaveBeenCalledWith({ isActive: true });
  });

  it("GET /api/products?includeInactive=true should return 403 for anonymous", async () => {
    const res = await request(app).get("/api/products?includeInactive=true");

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
    expect(res.body.error.message).toBe(
      "Bạn không có quyền xem sản phẩm đã ẩn",
    );
  });

  it("GET /api/products?includeInactive=true should return 200 for admin", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    const findSpy = vi.spyOn(Product, "find").mockResolvedValueOnce([
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
    expect(findSpy).toHaveBeenCalledWith({});
  });

  it("GET /api/products/:idOrCode should return 200 when found", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValueOnce(mockProduct());

    const res = await request(app).get("/api/products/ip16-001");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lấy thông tin sản phẩm thành công");
    expect(res.body.data.productCode).toBe("IP16-001");
  });

  it("GET /api/products/:idOrCode should return 404 when not found", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValueOnce(null);

    const res = await request(app).get("/api/products/IP16-404");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E404_NOT_FOUND");
  });

  it("POST /api/products should return 401 when missing bearer token", async () => {
    const res = await request(app).post("/api/products").send({
      productCode: "IP16-001",
      productName: "iPhone 16",
      brand: "Apple",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
  });

  it("POST /api/products should return 403 when user is not admin", async () => {
    const userToken = makeAccessToken({ role: "user" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productCode: "IP16-001",
        productName: "iPhone 16",
        brand: "Apple",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("POST /api/products should return 201 when admin creates product", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    vi.spyOn(Product, "findOne").mockResolvedValueOnce(null);
    vi.spyOn(Product.prototype, "save").mockImplementationOnce(function save() {
      this.createdAt = "2026-03-24T01:56:02.768Z";
      this.updatedAt = "2026-03-24T01:56:02.768Z";
      return Promise.resolve(this);
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productCode: "ip16-001",
        productName: " iPhone 16 ",
        brand: " Apple ",
        model: "A18",
        color: "Black",
        configuration: "256GB, 12GB RAM",
        specifications: {
          ram: "12GB",
          storage: "256GB",
          processor: "A18",
          screenSize: "6.1 inch",
        },
        imageUrl: "https://example.com/iphone16.jpg",
        price: 29990000,
        warrantyMonths: 12,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tạo sản phẩm thành công");
    expect(res.body.data.productCode).toBe("IP16-001");
    expect(res.body.data.createdAt).toBeDefined();
    expect(res.body.data.updatedAt).toBeUndefined();
  });

  it("POST /api/products should return 400 when required fields are missing", async () => {
    const adminToken = makeAccessToken({ role: "admin" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productCode: "",
        productName: "iPhone 16",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_MISSING_FIELD");
    expect(res.body.error.details).toContain("productCode");
    expect(res.body.error.details).toContain("brand");
  });

  it("POST /api/products should return 400 when productCode is duplicated", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    vi.spyOn(Product, "findOne").mockResolvedValueOnce(mockProduct());

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productCode: "IP16-001",
        productName: "iPhone 16",
        brand: "Apple",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_VALIDATION");
    expect(res.body.error.message).toBe("Mã sản phẩm đã tồn tại");
  });

  it("PUT /api/products/:idOrCode should return 400 when trying to update productCode", async () => {
    const adminToken = makeAccessToken({ role: "admin" });

    const res = await request(app)
      .put("/api/products/IP16-001")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productCode: "IP16-777",
        productName: "iPhone 16 Pro",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E400_VALIDATION");
    expect(res.body.error.details).toContain("productCode");
  });

  it("PUT /api/products/:idOrCode should return 200 when update succeeds", async () => {
    const adminToken = makeAccessToken({ role: "admin" });
    vi.spyOn(Product, "findOneAndUpdate").mockResolvedValueOnce(
      mockProduct({
        productName: "iPhone 16 Pro",
        price: 31990000,
        updatedAt: "2026-03-24T02:05:00.000Z",
      }),
    );

    const res = await request(app)
      .put("/api/products/IP16-001")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productName: "iPhone 16 Pro",
        price: 31990000,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Cập nhật sản phẩm thành công");
    expect(res.body.data.updatedAt).toBeDefined();
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
    expect(res.body.message).toBe("Ẩn sản phẩm thành công");
    expect(res.body.data.isActive).toBe(false);
    expect(updateSpy).toHaveBeenCalled();
    expect(updateSpy.mock.calls[0][1]).toEqual({ $set: { isActive: false } });
  });
});
