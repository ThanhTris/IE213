const request = require("supertest");
const jwt = require("jsonwebtoken");
const Warranty = require("../../../backend/src/models/WarrantyModel");
const Product = require("../../../backend/src/models/ProductModel");
const User = require("../../../backend/src/models/UserModel");
const app = require("../../../backend/src/app");

vi.mock("../../../backend/src/models/ProductModel");
vi.mock("../../../backend/src/models/UserModel");

process.env.JWT_SECRET = "test-jwt-secret";
process.env.PINATA_JWT = "mock-jwt";

const mockFindOneLean = (resolvedValue) => {
  return vi.spyOn(Warranty, "findOne").mockReturnValueOnce({
    lean: vi.fn().mockResolvedValueOnce(resolvedValue),
  });
};

describe("Warranty Public Verify Endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch for Pinata
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ IpfsHash: "mock-cid" }),
    });
  });

  it("GET /api/warranties/verify/:serialNumber should return masked ownerWallet", async () => {
    const rawOwnerWallet = "0x1234567890abcdef1234567890abcdef1234abcd";

    mockFindOneLean({
      serialNumber: "SN-001",
      serialHash: "0xaaaa...",
      ownerWallet: rawOwnerWallet,
      productCode: "IP16-001",
      expiryDate: 1798765200,
      status: true,
      tokenId: "101",
      tokenURI: "ipfs://test-token-uri",
      txHash: "0xbbbb...",
      mintedAt: "2026-03-30T07:00:00.000Z",
    });

    vi.spyOn(Product, "findOne").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({ productCode: "IP16-001", productName: "iPhone 16" }),
    });
    vi.spyOn(User, "findOne").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({ walletAddress: rawOwnerWallet, fullName: "Test User" }),
    });

    const res = await request(app).get("/api/warranties/verify/SN-001");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tra cứu bảo hành thành công");

    expect(res.body.data.ownerWallet).toBe("0x1234...abcd");
    expect(res.body.data.ownerWallet).not.toBe(rawOwnerWallet);
    expect(res.body.data.isMinted).toBe(true);
    expect(res.body.data.tokenURI).toBe("ipfs://test-token-uri");
  });

  it("GET /api/warranties/verify/:serialNumber should return 404 when not found", async () => {
    mockFindOneLean(null);

    const res = await request(app).get("/api/warranties/verify/SN-NOT-FOUND");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("Warranty Protected Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch for Pinata
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ IpfsHash: "mock-cid" }),
    });
  });

  const makeAccessToken = ({ walletAddress, role = "user" }) => {
    return jwt.sign(
      {
        userId: "testUser",
        walletAddress,
        role
      },
      process.env.JWT_SECRET || "test-jwt-secret",
      { expiresIn: "1h" }
    );
  };

  it("GET /api/warranties should return all warranties for admin", async () => {
    vi.spyOn(Warranty, "find").mockReturnValueOnce({
      sort: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce([{ serialNumber: "SN-ADMIN" }]),
      }),
    });

    const token = makeAccessToken({ walletAddress: "0xAdmin", role: "admin" });
    const res = await request(app)
      .get("/api/warranties")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].serialNumber).toBe("SN-ADMIN");
  });

  it("GET /api/warranties/my-warranties should return user warranties", async () => {
    const userWallet = "0xUser123";
    vi.spyOn(Warranty, "find").mockReturnValueOnce({
      sort: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce([{ serialNumber: "SN-USER123", ownerWallet: userWallet.toLowerCase() }]),
      }),
    });

    const token = makeAccessToken({ walletAddress: userWallet, role: "user" });
    const res = await request(app)
      .get("/api/warranties/my-warranties")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].serialNumber).toBe("SN-USER123");
  });
});


