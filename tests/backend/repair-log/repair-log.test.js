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
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
  });

  it("POST /api/repair-logs should ignore unknown fields in body", async () => {
    const walletAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const token = makeAccessToken({ role: "technician", walletAddress });

    mockFindOneLean(Warranty, {
      _id: "507f1f77bcf86cd799439011",
      serialNumber: "SN-001",
      tokenId: "1001",
      status: true,
    });

    vi.spyOn(User, "findOne").mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce({
          walletAddress,
          fullName: "",
        }),
      }),
    });

    vi.spyOn(RepairLog.prototype, "save").mockImplementationOnce(
      function save() {
        this._id = "507f1f77bcf86cd799439012";
        return Promise.resolve(this);
      },
    );

    const res = await request(app)
      .post("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-001",
        repairContent: "Thay pin",
        hackerField: "not-allowed",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serialNumber).toBe("SN-001");
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
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
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
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E404_NOT_FOUND");
  });

  it("POST /api/repair-logs should return 400 when warranty status is false", async () => {
    const token = makeAccessToken({ role: "technician" });
    mockFindOneLean(Warranty, {
      _id: "507f1f77bcf86cd799439011",
      serialNumber: "SN-DENIED",
      tokenId: null,
      status: false,
    });

    const res = await request(app)
      .post("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-DENIED",
        repairContent: "Thay màn hình",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Thiết bị đã bị từ chối bảo hành");
  });

  it("POST /api/repair-logs should create repair log with fallback technicianName", async () => {
    const walletAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const token = makeAccessToken({ role: "technician", walletAddress });

    mockFindOneLean(Warranty, {
      _id: "507f1f77bcf86cd799439011",
      serialNumber: "SN-001",
      tokenId: "1001",
      status: true,
    });

    vi.spyOn(User, "findOne").mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce({
          walletAddress,
          fullName: "",
        }),
      }),
    });

    vi.spyOn(RepairLog.prototype, "save").mockImplementationOnce(
      function save() {
        this._id = "507f1f77bcf86cd799439012";
        this.createdAt = new Date("2026-03-30T08:00:00.000Z");
        this.updatedAt = new Date("2026-03-30T08:00:00.000Z");
        return Promise.resolve(this);
      },
    );

    const res = await request(app)
      .post("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serialNumber: "SN-001",
        repairContent: "Thay pin và vệ sinh máy",
        partsReplaced: ["Pin iPhone 15"],
        cost: 450000,
        notes: "Khách yêu cầu kiểm tra thêm loa",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tạo nhật ký sửa chữa thành công");
    expect(res.body.data.serialNumber).toBe("SN-001");
    expect(res.body.data.technicianWallet).toBe(walletAddress);
    expect(res.body.data.technicianName).toBe(walletAddress);
    expect(res.body.data.tokenId).toBe("1001");
  });

  it("GET /api/repair-logs/device/:serialNumber should be public and return array", async () => {
    mockFindOneSelectLean(Warranty, {
      _id: "507f1f77bcf86cd799439011",
      serialNumber: "SN-001",
      status: true,
    });

    vi.spyOn(RepairLog, "find").mockReturnValueOnce({
      sort: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce([
          {
            _id: "507f1f77bcf86cd799439111",
            serialNumber: "SN-001",
            repairContent: "Thay pin",
          },
        ]),
      }),
    });

    const res = await request(app).get("/api/repair-logs/device/SN-001");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it("GET /api/repair-logs/device/:serialNumber should return 404 when serial not found in warranties", async () => {
    mockFindOneSelectLean(Warranty, null);

    const res = await request(app).get("/api/repair-logs/device/SN-NOT-FOUND");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E404_NOT_FOUND");
  });

  it("GET /api/repair-logs should return 403 for role user", async () => {
    const token = makeAccessToken({ role: "user" });

    const res = await request(app)
      .get("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("GET /api/repair-logs should return all logs for staff sorted by createdAt desc", async () => {
    const token = makeAccessToken({ role: "staff" });
    const sortSpy = vi.fn().mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce([
        { _id: "1", serialNumber: "SN-002" },
        { _id: "2", serialNumber: "SN-001" },
      ]),
    });
    const findSpy = vi.spyOn(RepairLog, "find").mockReturnValueOnce({
      sort: sortSpy,
    });

    const res = await request(app)
      .get("/api/repair-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(findSpy).toHaveBeenCalledWith({});
    expect(sortSpy).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("PATCH /api/repair-logs/:id should return 401 when missing bearer token", async () => {
    const res = await request(app)
      .patch("/api/repair-logs/507f1f77bcf86cd799439011")
      .send({
        notes: "Đã cập nhật",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E401_UNAUTHORIZED");
  });

  it("PATCH /api/repair-logs/:id should return 403 for role staff", async () => {
    const token = makeAccessToken({ role: "staff" });

    const res = await request(app)
      .patch("/api/repair-logs/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .send({
        notes: "Đã cập nhật",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("PATCH /api/repair-logs/:id should return 403 when technician edits another technician log", async () => {
    const token = makeAccessToken({
      role: "technician",
      walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    vi.spyOn(RepairLog, "findById").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        technicianWallet: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      }),
    });

    const res = await request(app)
      .patch("/api/repair-logs/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .send({
        notes: "Sửa lại ghi chú",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("E403_FORBIDDEN");
  });

  it("PATCH /api/repair-logs/:id should allow technician to edit own log", async () => {
    const walletAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const token = makeAccessToken({ role: "technician", walletAddress });

    vi.spyOn(RepairLog, "findById").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        technicianWallet: walletAddress,
      }),
    });

    vi.spyOn(RepairLog, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      technicianWallet: walletAddress,
      repairContent: "Đã sửa lại nội dung",
      partsReplaced: ["Pin iPhone 15 Pro Max (chính hãng)"],
      cost: 1200000,
      notes: "Đã sửa lần 2",
    });

    const res = await request(app)
      .patch("/api/repair-logs/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .send({
        repairContent: "Đã sửa lại nội dung",
        partsReplaced: ["Pin iPhone 15 Pro Max (chính hãng)"],
        cost: 1200000,
        notes: "Đã sửa lần 2",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cost).toBe(1200000);
  });

  it("PATCH /api/repair-logs/:id should allow admin to edit any log", async () => {
    const token = makeAccessToken({
      role: "admin",
      walletAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
    });

    vi.spyOn(RepairLog, "findById").mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        technicianWallet: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      }),
    });

    vi.spyOn(RepairLog, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      notes: "Admin đã cập nhật",
    });

    const res = await request(app)
      .patch("/api/repair-logs/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .send({
        notes: "Admin đã cập nhật",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes).toBe("Admin đã cập nhật");
  });
});
