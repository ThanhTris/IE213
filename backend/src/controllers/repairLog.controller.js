const RepairLog = require("../models/RepairLogModel");
const Warranty = require("../models/WarrantyModel");
const User = require("../models/UserModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

const EVM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;

const normalizeText = (value = "") => String(value).trim();
const normalizeWallet = (value = "") => String(value).trim().toLowerCase();

const createRepairLog = async (req, res) => {
  try {
    const allowedFields = new Set([
      "serialNumber",
      "repairType",
      "serviceCenter",
      "repairContent",
      "status",
      "completionDate",
      "partsReplaced",
      "cost",
      "notes",
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

    let partsReplaced = [];
    if (payload.partsReplaced !== undefined) {
      if (!Array.isArray(payload.partsReplaced)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "partsReplaced phải là mảng chuỗi",
          details: ["partsReplaced"],
        });
      }

      const sanitizedParts = payload.partsReplaced
        .filter((item) => item !== null && item !== undefined)
        .map((item) => normalizeText(item))
        .filter(Boolean);

      if (sanitizedParts.length !== payload.partsReplaced.length) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "partsReplaced chỉ chấp nhận chuỗi không rỗng",
          details: ["partsReplaced"],
        });
      }

      partsReplaced = sanitizedParts;
    }

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

    let notes;
    if (payload.notes !== undefined && payload.notes !== null) {
      if (typeof payload.notes !== "string") {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "notes phải là chuỗi",
          details: ["notes"],
        });
      }
      notes = normalizeText(payload.notes);
    }

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

    const technicianWallet = normalizeWallet(req.user?.walletAddress || "");
    if (!technicianWallet || !EVM_ADDRESS_REGEX.test(technicianWallet)) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Không tìm thấy technician wallet hợp lệ trong token",
        details: ["walletAddress"],
      });
    }

    const technicianUser = await User.findOne({
      walletAddress: technicianWallet,
    })
      .select("fullName walletAddress")
      .lean();

    const technicianName =
      normalizeText(technicianUser?.fullName || "") || technicianWallet;

    const repairLog = new RepairLog({
      warrantyId: warranty._id,
      serialNumber: warranty.serialNumber,
      tokenId: warranty.tokenId || null,
      technicianWallet,
      technicianName,
      status: payload.status || "completed",
      completionDate: payload.completionDate || null,
      repairType: normalizeText(payload.repairType),
      serviceCenter: normalizeText(payload.serviceCenter),
      repairContent,
      partsReplaced,
      cost,
      notes,
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

const getAllRepairLogs = async (req, res) => {
  try {
    const sortQuery = normalizeText(req.query?.sort || "desc").toLowerCase();
    const sortDirection = sortQuery === "asc" ? 1 : -1;

    const repairLogs = await RepairLog.find({})
      .populate({
        path: "warrantyId",
        select: "ownerAddress productCode expiryDate status",
      })
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
      "repairType",
      "serviceCenter",
      "repairContent",
      "status",
      "completionDate",
      "partsReplaced",
      "cost",
      "notes",
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

    if (payload.partsReplaced !== undefined) {
      if (!Array.isArray(payload.partsReplaced)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "partsReplaced phải là mảng chuỗi",
          details: ["partsReplaced"],
        });
      }

      const sanitizedParts = payload.partsReplaced
        .filter((item) => item !== null && item !== undefined)
        .map((item) => normalizeText(item))
        .filter(Boolean);

      if (sanitizedParts.length !== payload.partsReplaced.length) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "partsReplaced chỉ chấp nhận chuỗi không rỗng",
          details: ["partsReplaced"],
        });
      }

      updates.partsReplaced = sanitizedParts;
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

    if (payload.notes !== undefined) {
      if (payload.notes !== null && typeof payload.notes !== "string") {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "notes phải là chuỗi hoặc null",
          details: ["notes"],
        });
      }
      updates.notes =
        payload.notes === null ? null : normalizeText(payload.notes);
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

module.exports = {
  createRepairLog,
  getRepairLogsBySerialNumber,
  getAllRepairLogs,
  updateRepairLog,
};
