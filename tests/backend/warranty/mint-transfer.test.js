const path = require("path");
const request = require("supertest");
const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env.test"),
});

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

const Warranty = require("../../../backend/src/models/WarrantyModel");
const User = require("../../../backend/src/models/UserModel");
const Product = require("../../../backend/src/models/ProductModel");
const TransferHistory = require("../../../backend/src/models/TranferHistoryModel");
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

describe("Mint & Transfer Flows", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("POST /api/warranties should accept warrantyMonths and create warranty", async () => {
    const owner = "0x1111111111111111111111111111111111111111";

    vi.spyOn(User, "findOne").mockReturnValueOnce({
      lean: vi
        .fn()
        .mockResolvedValueOnce({ walletAddress: owner.toLowerCase() }),
    });
    vi.spyOn(Product, "findOne").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        productName: "Test Product",
        brand: "Brand",
        color: "Black",
        configuration: "Std",
        warrantyMonths: 12,
      }),
    });
    vi.spyOn(Warranty, "findOne").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null),
    });

    const savedWarranty = {
      serialNumber: "SN-TEST-001",
      serialHash: "0x" + "a".repeat(64),
      ownerAddress: owner.toLowerCase(),
      productCode: "PRD001",
      productInfo: { productName: "Test Product" },
      expiryDate: 1234567890,
    };

    vi.spyOn(Warranty.prototype, "save").mockResolvedValueOnce(savedWarranty);

    const token = makeAccessToken({
      walletAddress: owner.toLowerCase(),
      role: "staff",
    });

    const res = await request(app)
      .post("/api/warranties")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-TEST-001",
        productCode: "PRD001",
        ownerAddress: owner,
        warrantyMonths: 24,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serialNumber).toBe("SN-TEST-001");
  });

  it("PATCH /api/warranties/:id should update mint and create transfer history", async () => {
    const id = "609e128f1c4ae72f48e7b111";
    const tokenId = "1001";
    const txHash = "0x" + "b".repeat(64);

    const updatedWarranty = {
      _id: id,
      serialNumber: "SN-1001",
      ownerAddress: "0x2222222222222222222222222222222222222222",
      tokenId: tokenId,
      tokenURI: "ipfs://finalhash",
    };

    vi.spyOn(Warranty, "findByIdAndUpdate").mockResolvedValueOnce(
      updatedWarranty,
    );
    vi.spyOn(TransferHistory, "create").mockResolvedValueOnce({ id: "th1" });

    const token = makeAccessToken({
      walletAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      role: "staff",
    });

    const res = await request(app)
      .patch(`/api/warranties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tokenId, txHash, tokenURI: "ipfs://finalhash" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Warranty.findByIdAndUpdate).toHaveBeenCalled();
    expect(TransferHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ tokenId, txHash }),
    );
  });

  it("POST /api/transfers should allow owner to transfer and create history", async () => {
    const tokenId = "2001";
    const sender = "0x3333333333333333333333333333333333333333";
    const to = "0x4444444444444444444444444444444444444444";
    const txHash = "0x" + "c".repeat(64);

    vi.spyOn(Warranty, "findOne").mockResolvedValueOnce({
      _id: "wid1",
      tokenId,
      serialNumber: "SN-2001",
      ownerAddress: sender.toLowerCase(),
    });

    vi.spyOn(Warranty, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "wid1",
      tokenId,
      serialNumber: "SN-2001",
      ownerAddress: to.toLowerCase(),
    });

    vi.spyOn(TransferHistory, "create").mockResolvedValueOnce({ id: "th2" });

    const token = makeAccessToken({
      walletAddress: sender.toLowerCase(),
      role: "user",
    });

    const res = await request(app)
      .post(`/api/transfers`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tokenId, toAddress: to, txHash });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(Warranty.findOne).toHaveBeenCalledWith({ tokenId });
    expect(TransferHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ tokenId, txHash }),
    );
  });
});
