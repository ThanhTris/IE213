const RepairLog = require("../models/RepairLogModel");
const Warranty = require("../models/WarrantyModel");
const User = require("../models/UserModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

const EVM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;

const normalizeText = (value = "") => String(value).trim();
const normalizeWallet = (value = "") => String(value).trim().toLowerCase();

// POST /api/repair-logs
const createRepairLog = async (req, res) => {
  try {
    const allowedFields = new Set([
      "serialNumber",
      "repairContent",
      "isWarrantyCovered",
      "status",
      "cost",
    ]);
    const payload = Object.entries(req.body || {}).reduce(
      (acc, [key, value]) => {
        if (allowedFields.has(key)) acc[key] = value;
        return acc;
      },
      {},
    );

    const serialNumber = normalizeText(payload.serialNumber);
    const repairContent = normalizeText(payload.repairContent);

    if (!serialNumber) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "serialNumber là trường bắt buộc",
        details: ["serialNumber"],
      });
    }

    if (!repairContent) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "repairContent là trường bắt buộc",
        details: ["repairContent"],
      });
    }

    // isWarrantyCovered (boolean, bắt buộc)
    if (payload.isWarrantyCovered === undefined) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "isWarrantyCovered là trường bắt buộc (true/false)",
        details: ["isWarrantyCovered"],
      });
    }
    const isWarrantyCovered = Boolean(payload.isWarrantyCovered === true || payload.isWarrantyCovered === "true");

    // status (optional, default "pending")
    const VALID_STATUSES = ["pending", "in_progress", "done", "rejected"];
    let status = "pending";
    if (payload.status !== undefined) {
      const normalizedStatus = normalizeText(payload.status).toLowerCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: `status không hợp lệ. Hỗ trợ: ${VALID_STATUSES.join(", ")}`,
          details: ["status"],
        });
      }
      status = normalizedStatus;
    }

    // cost (optional, default 0)
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

    // Tìm warranty theo serialNumber
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

    // Lấy technicianWallet từ JWT token
    const technicianWallet = normalizeWallet(req.user?.walletAddress || "");
    if (!technicianWallet || !EVM_ADDRESS_REGEX.test(technicianWallet)) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Không tìm thấy technician wallet hợp lệ trong token",
        details: ["walletAddress"],
      });
    }

    const repairLog = new RepairLog({
      warrantyId: warranty._id,
      serialNumber: warranty.serialNumber,
      technicianWallet,
      repairContent,
      isWarrantyCovered,
      status,
      cost,
    });

    const savedRepairLog = await repairLog.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: "Tạo nhật ký sửa chữa thành công",
      data: savedRepairLog,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Dữ liệu nhật ký sửa chữa không hợp lệ",
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

// GET /api/repair-logs/device/:serialNumber
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
      data: repairLogs,
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// GET /api/repair-logs
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
      data: repairLogs,
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      errorCode: "E500_INTERNAL",
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// PATCH /api/repair-logs/:id — Cập nhật (admin hoặc chủ repair log)
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
      "repairContent",
      "isWarrantyCovered",
      "status",
      "cost",
    ]);
    const payload = Object.entries(req.body || {}).reduce(
      (acc, [key, value]) => {
        if (allowedFields.has(key)) acc[key] = value;
        return acc;
      },
      {},
    );
    const payloadKeys = Object.keys(payload);

    if (payloadKeys.length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có dữ liệu để cập nhật",
      });
    }

    const existingLog = await RepairLog.findById(id).lean();
    if (!existingLog) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy nhật ký sửa chữa",
      });
    }

    const actorRole = normalizeText(req.user?.role || "").toLowerCase();
    const actorWallet = normalizeWallet(req.user?.walletAddress || "");
    const isAdmin = actorRole === "admin";
    const isOwnRepairLog =
      actorWallet && actorWallet === existingLog.technicianWallet;

    if (!isAdmin && !isOwnRepairLog) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn không có quyền chỉnh sửa nhật ký sửa chữa này",
      });
    }

    const updates = {};

    if (payload.repairContent !== undefined) {
      const repairContent = normalizeText(payload.repairContent);
      if (!repairContent) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "repairContent không được để trống",
          details: ["repairContent"],
        });
      }
      updates.repairContent = repairContent;
    }

    if (payload.isWarrantyCovered !== undefined) {
      updates.isWarrantyCovered = Boolean(
        payload.isWarrantyCovered === true || payload.isWarrantyCovered === "true",
      );
    }

    if (payload.status !== undefined) {
      const VALID_STATUSES = ["pending", "in_progress", "done", "rejected"];
      const normalizedStatus = normalizeText(payload.status).toLowerCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: `status không hợp lệ. Hỗ trợ: ${VALID_STATUSES.join(", ")}`,
          details: ["status"],
        });
      }
      updates.status = normalizedStatus;
    }

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
      updates.cost = parsedCost;
    }

    const updatedRepairLog = await RepairLog.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật nhật ký sửa chữa thành công",
      data: updatedRepairLog,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Dữ liệu cập nhật nhật ký sửa chữa không hợp lệ",
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

// GET /api/repair-logs/history-by-model/:productCode
const getRepairLogsByModel = async (req, res) => {
  try {
    const { productCode } = req.params;

    if (!productCode) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "productCode là trường bắt buộc",
      });
    }

    const normalizedCode = productCode.trim().toUpperCase();

    // 1. Trích xuất mã dòng máy gốc (Base Model Code)
    const parts = normalizedCode.split("-");
    const baseCode = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : normalizedCode;
    
    // 2. Tìm tất cả Warranty thuộc dòng máy này (Regex)
    const warranties = await Warranty.find({ 
      productCode: { $regex: new RegExp("^" + baseCode) }
    }).select("_id serialNumber productCode").lean();

    const warrantyIds = warranties.map(w => w._id);
    const serialNumbers = warranties.map(w => w.serialNumber).filter(Boolean);

    if (warrantyIds.length === 0 && serialNumbers.length === 0) {
      return sendSuccess(res, {
        statusCode: 200,
        message: "Dòng máy này chưa có thiết bị nào được kích hoạt bảo hành",
        data: [],
      });
    }

    // 3. Tìm tất cả RepairLog thuộc danh sách warrantyIds HOẶC serialNumbers
    const rawRepairLogs = await RepairLog.find({
      $or: [
        { warrantyId: { $in: warrantyIds } },
        { serialNumber: { $in: serialNumbers } }
      ]
    })
    .sort({ repairDate: -1 })
    .lean();

    // 4. Khử trùng lặp dữ liệu trước khi gửi về FE
    // Tiêu chí: Cùng serialNumber, cùng repairContent, cùng ngày sửa chữa
    const uniqueLogsMap = new Map();
    
    rawRepairLogs.forEach(log => {
      const dateKey = log.repairDate ? new Date(log.repairDate).toISOString().split("T")[0] : "no-date";
      const uniqueKey = `${log.serialNumber}-${log.repairContent}-${dateKey}`;
      
      if (!uniqueLogsMap.has(uniqueKey)) {
        uniqueLogsMap.set(uniqueKey, log);
      }
    });

    const repairLogs = Array.from(uniqueLogsMap.values());

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy lịch sử sửa chữa theo dòng máy thành công",
      data: repairLogs,
    });
  } catch (error) {
    console.error("[RepairLog Controller] Error in getRepairLogsByModel:", error);
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
  getRepairLogsByModel,
  getAllRepairLogs,
  updateRepairLog,
};
