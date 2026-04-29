const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

const app = require("../../../backend/src/app");
const RepairLog = require("../../../backend/src/models/RepairLogModel");
const Warranty = require("../../../backend/src/models/WarrantyModel");
const User = require("../../../backend/src/models/UserModel");

const makeAccessToken = ({
  role = "user",
  walletAddress = "0x1234567890123456789012345678901234567890",
} = {}) => {
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

const mockFindOneLean = (model, value) => {
  return vi.spyOn(model, "findOne").mockReturnValueOnce({
    lean: vi.fn().mockResolvedValueOnce(value),
  });
};

const mockFindOneSelectLean = (model, value) => {
  return vi.spyOn(model, "findOne").mockReturnValueOnce({
    select: vi.fn().mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(value),
    }),
  });
};

describe("Repair Log Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("POST /api/repair-logs should return 401 when missing bearer token", async () => {
    const res = await request(app).post("/api/repair-logs").send({
      serialNumber: "SN-001",
      repairContent: "Thay pin",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/repair-logs should return 403 for role staff", async () => {
    const token = makeAccessToken({ role: "staff" });

    const res = await request(app)
      .post("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-404",
        repairContent: "Kiểm tra main",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/repair-logs should return 404 when warranty is not found", async () => {
    const token = makeAccessToken({ role: "technician" });
    mockFindOneLean(Warranty, null);

    const res = await request(app)
      .post("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-404",
        repairContent: "Kiểm tra main",
        isWarrantyCovered: true,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/repair-logs should create repair log successfully", async () => {
    const walletAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const token = makeAccessToken({ role: "technician", walletAddress });

    mockFindOneLean(Warranty, {
      _id: "507f1f77bcf86cd799439011",
      serialNumber: "SN-001",
      status: true,
    });

    vi.spyOn(RepairLog.prototype, "save").mockImplementationOnce(
      function save() {
        this._id = "507f1f77bcf86cd799439012";
        this.repairDate = new Date("2026-03-30T08:00:00.000Z");
        return Promise.resolve(this);
      },
    );

    const res = await request(app)
      .post("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-001",
        note: "Thay pin và vệ sinh máy",
        isWarrantyCovered: true,
        cost: 0,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serialNumber).toBe("SN-001");
    expect(res.body.data.technicianWallet).toBe(walletAddress);
    expect(res.body.data.repairContent).toBe("Thay pin và vệ sinh máy");
    expect(res.body.data.status).toBe("pending");
  });

  it("GET /api/repair-logs/device/:serialNumber should be public", async () => {
    mockFindOneSelectLean(Warranty, {
      _id: "507f1f77bcf86cd799439011",
      serialNumber: "SN-001",
    });

    vi.spyOn(RepairLog, "find").mockReturnValueOnce({
      sort: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce([
          {
            _id: "507f1f77bcf86cd799439111",
            serialNumber: "SN-001",
            currentStatus: "completed",
            timeline: [{ status: "pending", note: "Thay pin" }]
          },
        ]),
      }),
    });

    const res = await request(app).get("/api/repair-logs/device/SN-001");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].repairContent).toBe("Thay pin");
  });

  it("PATCH /api/repair-logs/:id should allow technician to edit own log", async () => {
    const walletAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const token = makeAccessToken({ role: "technician", walletAddress });

    vi.spyOn(RepairLog, "findById").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        technicianWallet: walletAddress,
        currentStatus: "fixing"
      }),
    });

    vi.spyOn(RepairLog, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      technicianWallet: walletAddress,
      currentStatus: "completed",
      timeline: [{ status: "completed", note: "Đã sửa xong" }],
      toObject: function() { return this; }
    });

    const res = await request(app)
      .patch("/api/repair-logs/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .send({
        note: "Đã sửa xong",
        status: "completed",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("completed");
  });
});

