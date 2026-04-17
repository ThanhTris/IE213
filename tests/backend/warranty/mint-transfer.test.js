const request = require("supertest");
const jwt = require("jsonwebtoken");
const Warranty = require("../../../backend/src/models/WarrantyModel");
const User = require("../../../backend/src/models/UserModel");
const Product = require("../../../backend/src/models/ProductModel");
const TransferHistory = require("../../../backend/src/models/TranferHistoryModel");
const app = require("../../../backend/src/app");

process.env.JWT_SECRET = "test-jwt-secret";
process.env.PINATA_JWT = "mock-jwt";

const makeAccessToken = ({ walletAddress, role = "user" }) => {
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

describe("Mint & Transfer Flows", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch for Pinata
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ IpfsHash: "mock-cid" }),
    });
  });

  it("POST /api/warranties should accept expiryDate and create warranty (multipart)", async () => {
    const owner = "0x1111111111111111111111111111111111111111";

    vi.spyOn(User, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValueOnce({
        walletAddress: owner.toLowerCase(),
      }),
    });
    vi.spyOn(Product, "findOne").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        productName: "Test Product",
        brand: "Brand",
        imageUrl: "ipfs://product-img",
        warrantyMonths: 12,
      }),
    });
    vi.spyOn(Warranty, "findOne").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null),
    });

    const savedWarranty = {
      serialNumber: "SN-TEST-001",
      serialHash: "0x" + "a".repeat(64),
      ownerWallet: owner.toLowerCase(),
      productCode: "PRD001",
      tokenURI: "ipfs://mock-json-cid",
      status: true,
    };

    vi.spyOn(Warranty.prototype, "save").mockResolvedValueOnce(savedWarranty);

    const token = makeAccessToken({
      walletAddress: "0xStaff",
      role: "staff",
    });

    const res = await request(app)
      .post("/api/warranties")
      .set("Authorization", `Bearer ${token}`)
      .field("serialNumber", "SN-TEST-001")
      .field("productCode", "PRD001")
      .field("ownerWallet", owner)
      .attach("image", Buffer.from("fake-img"), "test.png");

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serialNumber).toBe("SN-TEST-001");
    expect(res.body.data.tokenURI).toBe("ipfs://mock-json-cid");
  });

  it("PATCH /api/warranties/:id should update mint and create transfer history", async () => {
    const id = "609e128f1c4ae72f48e7b111";
    const tokenId = "1001";
    const txHash = "0x" + "b".repeat(64);

    const updatedWarranty = {
      _id: id,
      serialNumber: "SN-1001",
      ownerWallet: "0x2222222222222222222222222222222222222222",
      tokenId: tokenId,
      txHash: txHash,
      tokenURI: "ipfs://finalhash",
    };

    vi.spyOn(Warranty, "findByIdAndUpdate").mockResolvedValueOnce(
      updatedWarranty,
    );
    vi.spyOn(TransferHistory, "create").mockResolvedValueOnce({ id: "th1" });

    const token = makeAccessToken({
      walletAddress: "0xStaff",
      role: "staff",
    });

    const res = await request(app)
      .patch(`/api/warranties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tokenId, txHash });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(TransferHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ 
        tokenId, 
        txHash,
        transferType: "mint",
        fromAddress: "0x0000000000000000000000000000000000000000"
      }),
    );
  });

  it("POST /api/transfers should allow owner to transfer and create history", async () => {
    const tokenId = "2001";
    const sender = "0x3333333333333333333333333333333333333333";
    const receiver = "0x4444444444444444444444444444444444444444";
    const txHash = "0x" + "c".repeat(64);

    vi.spyOn(Warranty, "findOne").mockResolvedValueOnce({
      _id: "wid1",
      tokenId,
      serialNumber: "SN-2001",
      ownerWallet: sender.toLowerCase(),
    });

    vi.spyOn(Warranty, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "wid1",
      tokenId,
      serialNumber: "SN-2001",
      ownerWallet: receiver.toLowerCase(),
    });

    vi.spyOn(TransferHistory, "create").mockResolvedValueOnce({ id: "th2" });

    const token = makeAccessToken({
      walletAddress: sender.toLowerCase(),
      role: "user",
    });

    const res = await request(app)
      .post(`/api/transfers`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tokenId, toAddress: receiver, txHash });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(TransferHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ 
        tokenId, 
        txHash,
        fromAddress: sender.toLowerCase(),
        toAddress: receiver.toLowerCase()
      }),
    );
  });
});

