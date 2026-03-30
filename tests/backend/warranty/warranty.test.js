const request = require("supertest");

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
