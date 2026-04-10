const path = require("path");
const request = require("supertest");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env.test"),
});
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

const Warranty = require("../../../backend/src/models/WarrantyModel");
const app = require("../../../backend/src/app");

const mockFindOneLean = (resolvedValue) => {
  return vi.spyOn(Warranty, "findOne").mockReturnValueOnce({
    lean: vi.fn().mockResolvedValueOnce(resolvedValue),
  });
};

describe("Warranty Public Verify Endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/warranties/verify/:serialNumber should return masked ownerAddress", async () => {
    const rawOwnerAddress = "0x1234567890abcdef1234567890abcdef1234abcd";

    const findOneSpy = mockFindOneLean({
      serialNumber: "SN-001",
      serialHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      ownerAddress: rawOwnerAddress,
      productCode: "IP16-001",
      productInfo: {
        productName: "iPhone 16",
        brand: "Apple",
        color: "Black",
        configuration: "256GB, 12GB RAM",
      },
      expiryDate: 1798765200,
      status: true,
      tokenId: "101",
      tokenURI: "ipfs://test-token-uri",
      mintTxHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      mintedAt: "2026-03-30T07:00:00.000Z",
    });

    const res = await request(app).get("/api/warranties/verify/SN-001");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tra cứu bảo hành thành công");
    expect(findOneSpy).toHaveBeenCalledWith({ serialNumber: "SN-001" });

    expect(res.body.data.ownerAddress).toBe("0x1234...abcd");
    expect(res.body.data.ownerAddress).not.toBe(rawOwnerAddress);
    expect(res.body.data.serialNumber).toBe("SN-001");
    expect(res.body.data.isMinted).toBe(true);
    expect(res.body.data.tokenURI).toBe("ipfs://test-token-uri");
  });

  it("GET /api/warranties/verify/:serialNumber should return 404 when not found", async () => {
    mockFindOneLean(null);

    const res = await request(app).get("/api/warranties/verify/SN-NOT-FOUND");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe(
      "Không tìm thấy phiếu bảo hành cho serialNumber này",
    );
  });

  it("GET /api/warranties/verify/:serialNumber should keep short ownerAddress unchanged", async () => {
    mockFindOneLean({
      serialNumber: "SN-SHORT",
      serialHash:
        "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      ownerAddress: "0x123456",
      productCode: "IP16-001",
      productInfo: {},
      expiryDate: 1798765200,
      status: true,
      tokenId: null,
      mintTxHash: null,
      mintedAt: null,
    });

    const res = await request(app).get("/api/warranties/verify/SN-SHORT");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ownerAddress).toBe("0x123456");
    expect(res.body.data.isMinted).toBe(false);
  });
});

describe("Warranty Protected Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const makeAccessToken = ({ walletAddress, role = "user" }) => {
    const jwt = require("jsonwebtoken");
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
        lean: vi.fn().mockResolvedValueOnce([{ serialNumber: "SN-USER123", ownerAddress: userWallet.toLowerCase() }]),
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

