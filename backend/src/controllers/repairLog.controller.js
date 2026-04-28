const RepairLog = require("../models/RepairLogModel");
const { REPAIR_STATUSES, VALID_TRANSITIONS, REPAIR_TYPES } = require("../models/RepairLogModel");
const Warranty = require("../models/WarrantyModel");
const Product = require("../models/ProductModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

const EVM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;

const normalizeText = (value = "") => String(value).trim();
const normalizeWallet = (value = "") => String(value).trim().toLowerCase();

// ──────────────────────────────────────────────────────────
// Nhãn tiếng Việt mặc định cho mỗi trạng thái
// (dùng khi user không cung cấp note)
// ──────────────────────────────────────────────────────────
const DEFAULT_STATUS_LABELS = {
  pending:       "Tiếp nhận thiết bị",
  waiting_parts: "Chờ linh kiện",
  fixing:        "Đang tiến hành sửa chữa",
  completed:     "Sửa chữa hoàn tất",
  delivered:     "Đã giao trả thiết bị cho khách",
  cancelled:     "Đã hủy phiếu sửa chữa",
};

// ──────────────────────────────────────────────────────────
// Helper: Format RepairLog cho FE
// ──────────────────────────────────────────────────────────
const toRepairResponse = (log) => {
  if (!log) return null;
  
  // Lấy note của bước pending đầu tiên làm nội dung sửa chữa chính
  const pendingEntry = (log.timeline || []).find(t => t.status === "pending");
  const repairContent = pendingEntry ? pendingEntry.note : (log.note || "");

  return {
    ...log,
    status: log.currentStatus,
    repairContent: repairContent,
  };
};

// ──────────────────────────────────────────────────────────
// POST /api/repair-logs
// Khởi tạo phiếu sửa chữa mới, tự động đẩy bước "pending"
// vào timeline
// ──────────────────────────────────────────────────────────
const createRepairLog = async (req, res) => {
  try {
    const allowedFields = new Set([
      "serialNumber",
      "note",
      "isWarrantyCovered",
      "cost",
      "type",
    ]);
    const payload = Object.entries(req.body || {}).reduce(
      (acc, [key, value]) => {
        if (allowedFields.has(key)) acc[key] = value;
        return acc;
      },
      {},
    );

    // ── Validate serialNumber ──
    const serialNumber = normalizeText(payload.serialNumber);
    if (!serialNumber) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "serialNumber là trường bắt buộc",
        details: ["serialNumber"],
      });
    }

    // ── isWarrantyCovered (boolean, bắt buộc) ──
    if (payload.isWarrantyCovered === undefined) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "isWarrantyCovered là trường bắt buộc (true/false)",
        details: ["isWarrantyCovered"],
      });
    }
    const isWarrantyCovered = Boolean(
      payload.isWarrantyCovered === true || payload.isWarrantyCovered === "true",
    );

    // ── cost (optional, default 0) ──
    let cost = 0;
    if (payload.cost !== undefined) {
      const parsedCost = Number(payload.cost);
      if (!Number.isFinite(parsedCost) || parsedCost < 0) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "cost phải là số không âm",
          details: ["cost"],
        });
      }
      cost = parsedCost;
    }

    // ── type (optional, default "Khác") ──
    const type = normalizeText(payload.type) || "Khác";
    if (payload.type && !REPAIR_TYPES.includes(type)) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: `type không hợp lệ. Hỗ trợ: ${REPAIR_TYPES.join(", ")}`,
        details: ["type"],
      });
    }

    // ── note cho bước pending (optional) ──
    const note = normalizeText(payload.note) || DEFAULT_STATUS_LABELS.pending;

    // ── Tìm warranty theo serialNumber ──
    const warranty = await Warranty.findOne({ serialNumber }).lean();
    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy phiếu bảo hành theo serialNumber",
        details: ["serialNumber"],
      });
    }

    if (warranty.status !== true) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Thiết bị đã bị từ chối bảo hành",
      });
    }

    // ── Lấy technicianWallet từ JWT token ──
    const technicianWallet = normalizeWallet(req.user?.walletAddress || "");
    if (!technicianWallet || !EVM_ADDRESS_REGEX.test(technicianWallet)) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Không tìm thấy technician wallet hợp lệ trong token",
        details: ["walletAddress"],
      });
    }

    // ── Tạo phiếu sửa chữa + push bước pending vào timeline ──
    const repairLog = new RepairLog({
      warrantyId: warranty._id,
      serialNumber: warranty.serialNumber,
      technicianWallet,
      currentStatus: "pending",
      isWarrantyCovered,
      cost,
      type,
      timeline: [
        {
          status: "pending",
          note,
          timestamp: new Date(),
        },
      ],
    });

    const savedRepairLog = await repairLog.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: "Tạo phiếu sửa chữa thành công",
      data: toRepairResponse(savedRepairLog.toObject()),
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Dữ liệu phiếu sửa chữa không hợp lệ",
        details: Object.values(error.errors || {}).map((e) => e.message),
      });
    }

    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// ──────────────────────────────────────────────────────────
// PATCH /api/repair-logs/:id
// Cập nhật tiến độ: $push thêm bước mới vào timeline,
// đồng thời update currentStatus, cost, isWarrantyCovered
// ──────────────────────────────────────────────────────────
const updateRepairLog = async (req, res) => {
  try {
    const id = normalizeText(req.params?.id || "");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "id repair log không hợp lệ",
        details: ["id"],
      });
    }

    const allowedFields = new Set([
      "status",
      "note",
      "isWarrantyCovered",
      "cost",
      "type",
    ]);
    const payload = Object.entries(req.body || {}).reduce(
      (acc, [key, value]) => {
        if (allowedFields.has(key)) acc[key] = value;
        return acc;
      },
      {},
    );

    if (Object.keys(payload).length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có dữ liệu để cập nhật",
      });
    }

    // ── Tìm phiếu sửa chữa hiện tại ──
    const existingLog = await RepairLog.findById(id).lean();
    if (!existingLog) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy phiếu sửa chữa",
      });
    }

    // ── Kiểm tra quyền: admin hoặc chính technician ──
    const actorRole = normalizeText(req.user?.role || "").toLowerCase();
    const actorWallet = normalizeWallet(req.user?.walletAddress || "");
    const isAdmin = actorRole === "admin";
    const isOwnRepairLog =
      actorWallet && actorWallet === existingLog.technicianWallet;

    if (!isAdmin && !isOwnRepairLog) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn không có quyền chỉnh sửa phiếu sửa chữa này",
      });
    }

    // ── Chuẩn bị update operations ──
    const updateOps = {};
    const setFields = {};

    // ── Xử lý chuyển trạng thái + push timeline ──
    if (payload.status !== undefined) {
      const newStatus = normalizeText(payload.status).toLowerCase();

      // Validate enum
      if (!REPAIR_STATUSES.includes(newStatus)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: `status không hợp lệ. Hỗ trợ: ${REPAIR_STATUSES.join(", ")}`,
          details: ["status"],
        });
      }

      // Validate luồng chuyển trạng thái
      const currentStatus = existingLog.currentStatus;
      const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

      if (!allowedNextStatuses.includes(newStatus)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: `Không thể chuyển từ "${currentStatus}" sang "${newStatus}". Trạng thái hợp lệ tiếp theo: ${allowedNextStatuses.join(", ") || "(kết thúc)"}`,
          details: ["status"],
        });
      }

      // Cập nhật currentStatus
      setFields.currentStatus = newStatus;

      // $push bước mới vào timeline
      const note = normalizeText(payload.note) || DEFAULT_STATUS_LABELS[newStatus] || "";
      updateOps.$push = {
        timeline: {
          status: newStatus,
          note,
          timestamp: new Date(),
        },
      };
    }

    // ── Cập nhật cost (nếu có) ──
    if (payload.cost !== undefined) {
      const parsedCost = Number(payload.cost);
      if (!Number.isFinite(parsedCost) || parsedCost < 0) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "cost phải là số không âm",
          details: ["cost"],
        });
      }
      setFields.cost = parsedCost;
    }

    // ── Cập nhật isWarrantyCovered (nếu có) ──
    if (payload.isWarrantyCovered !== undefined) {
      setFields.isWarrantyCovered = Boolean(
        payload.isWarrantyCovered === true || payload.isWarrantyCovered === "true",
      );
    }

    // ── Cập nhật type (nếu có) ──
    if (payload.type !== undefined) {
      const type = normalizeText(payload.type);
      if (!REPAIR_TYPES.includes(type)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: `type không hợp lệ. Hỗ trợ: ${REPAIR_TYPES.join(", ")}`,
          details: ["type"],
        });
      }
      setFields.type = type;
    }

    // ── Gán $set nếu có fields cần update ──
    if (Object.keys(setFields).length > 0) {
      updateOps.$set = setFields;
    }

    // ── Nếu không có gì thực sự update ──
    if (Object.keys(updateOps).length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có thay đổi hợp lệ để cập nhật",
      });
    }

    const updatedRepairLog = await RepairLog.findByIdAndUpdate(
      id,
      updateOps,
      { new: true, runValidators: true },
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật phiếu sửa chữa thành công",
      data: toRepairResponse(updatedRepairLog.toObject()),
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Dữ liệu cập nhật phiếu sửa chữa không hợp lệ",
        details: Object.values(error.errors || {}).map((e) => e.message),
      });
    }

    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/repair-logs/device/:serialNumber
// Lấy tất cả phiếu sửa chữa theo serialNumber
// (kèm timeline đầy đủ)
// ──────────────────────────────────────────────────────────
const getRepairLogsBySerialNumber = async (req, res) => {
  try {
    const serialNumber = normalizeText(req.params?.serialNumber || "");

    if (!serialNumber) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "serialNumber là trường bắt buộc",
        details: ["serialNumber"],
      });
    }

    const warranty = await Warranty.findOne({ serialNumber })
      .select("_id serialNumber")
      .lean();

    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy phiếu bảo hành theo serialNumber",
        details: ["serialNumber"],
      });
    }

    const repairLogs = await RepairLog.find({
      serialNumber: warranty.serialNumber,
    })
      .sort({ repairDate: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy lịch sử sửa chữa theo serialNumber thành công",
      data: repairLogs.map(toRepairResponse),
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/repair-logs
// Lấy toàn bộ phiếu sửa chữa (admin/staff/technician)
// ──────────────────────────────────────────────────────────
const getAllRepairLogs = async (req, res) => {
  try {
    const sortQuery = normalizeText(req.query?.sort || "desc").toLowerCase();
    const sortDirection = sortQuery === "asc" ? 1 : -1;

    const repairLogs = await RepairLog.find({})
      .sort({ createdAt: sortDirection })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy toàn bộ lịch sử sửa chữa thành công",
      data: repairLogs.map(toRepairResponse),
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/repair-logs/history-by-model/:productCode
// Lấy lịch sử sửa chữa cho tất cả thiết bị thuộc dòng máy
// ──────────────────────────────────────────────────────────
const getRepairLogsByModel = async (req, res) => {
  try {
    const productCode = normalizeText(req.params?.productCode || "");
    if (!productCode) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "productCode là trường bắt buộc",
      });
    }

    // 1. Tìm tất cả serialNumber của dòng máy này trong bảng Warranty
    const warranties = await Warranty.find({ productCode })
      .select("serialNumber")
      .lean();
    
    if (warranties.length === 0) {
      return sendSuccess(res, {
        statusCode: 200,
        message: "Dòng máy này chưa có phiếu bảo hành/sửa chữa nào",
        data: [],
      });
    }

    const serialNumbers = warranties.map(w => w.serialNumber);

    // 2. Tìm tất cả repair_log thuộc danh sách serialNumbers
    const repairLogs = await RepairLog.find({
      serialNumber: { $in: serialNumbers }
    })
    .sort({ repairDate: -1 })
    .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy lịch sử sửa chữa theo dòng máy thành công",
      data: repairLogs.map(toRepairResponse),
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

module.exports = {
  createRepairLog,
  getRepairLogsBySerialNumber,
  getAllRepairLogs,
  updateRepairLog,
  getRepairLogsByModel,
};
