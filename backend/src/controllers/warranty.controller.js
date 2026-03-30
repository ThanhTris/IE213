const crypto = require("crypto");
const mongoose = require("mongoose");
const Warranty = require("../models/WarrantyModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

const createWarranty = async (req, res) => {
  try {
    // Zero-trust whitelist: chỉ nhận đúng 3 field, bỏ qua phần còn lại từ client.
    const { serialNumber, productCode, ownerAddress } = req.body || {};

    if (!serialNumber || !productCode || !ownerAddress) {
      return sendError(res, {
        statusCode: 400,
        message: "serialNumber, productCode, ownerAddress là bắt buộc",
      });
    }

    const normalizedOwnerAddress = String(ownerAddress).trim().toLowerCase();
    if (!EVM_ADDRESS_REGEX.test(normalizedOwnerAddress)) {
      return sendError(res, {
        statusCode: 400,
        message: "ownerAddress không đúng định dạng ví EVM",
      });
    }

    const normalizedSerialNumber = String(serialNumber).trim();
    const normalizedProductCode = String(productCode).trim().toUpperCase();

    const customer = await User.findOne({
      walletAddress: normalizedOwnerAddress,
    }).lean();

    if (!customer) {
      return sendError(res, {
        statusCode: 404,
        message:
          "Khách hàng chưa có trong hệ thống. Vui lòng đăng ký tài khoản cho khách trước!",
      });
    }

    const product = await Product.findOne({
      productCode: normalizedProductCode,
    }).lean();

    if (!product) {
      return sendError(res, {
        statusCode: 404,
        message: "Mã sản phẩm không tồn tại!",
      });
    }

    const existedWarranty = await Warranty.findOne({
      serialNumber: normalizedSerialNumber,
    }).lean();
    if (existedWarranty) {
      return sendError(res, {
        statusCode: 409,
        message: "serialNumber đã tồn tại trong hệ thống bảo hành",
      });
    }

    const serialHash = `0x${crypto
      .createHash("sha256")
      .update(normalizedSerialNumber)
      .digest("hex")}`;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const warrantyMonths = Number(product.warrantyMonths) || 0;
    const expiryDate = nowInSeconds + warrantyMonths * 30 * 24 * 60 * 60;

    const warranty = new Warranty({
      serialNumber: normalizedSerialNumber,
      serialHash,
      ownerAddress: normalizedOwnerAddress,
      productCode: normalizedProductCode,
      productInfo: {
        productName: product.productName,
        brand: product.brand,
        color: product.color,
        configuration: product.configuration,
      },
      expiryDate,
      status: true,
    });

    const savedWarranty = await warranty.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: "Tạo phiếu bảo hành Pre-mint thành công",
      data: savedWarranty,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        message: "Dữ liệu bảo hành bị trùng lặp",
      });
    }

    if (error && error.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        message: "Dữ liệu đầu vào không hợp lệ",
        details: Object.values(error.errors || {}).map((e) => e.message),
      });
    }

    console.error("createWarranty error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const updateMintInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { tokenId, mintTxHash } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        statusCode: 400,
        message: "id không hợp lệ",
      });
    }

    if (!tokenId || !mintTxHash) {
      return sendError(res, {
        statusCode: 400,
        message: "tokenId và mintTxHash là bắt buộc",
      });
    }

    const normalizedTokenId = String(tokenId).trim();
    const normalizedTxHash = String(mintTxHash).trim().toLowerCase();

    if (!EVM_TX_HASH_REGEX.test(normalizedTxHash)) {
      return sendError(res, {
        statusCode: 400,
        message: "mintTxHash không đúng định dạng tx hash",
      });
    }

    const updatedWarranty = await Warranty.findByIdAndUpdate(
      id,
      {
        tokenId: normalizedTokenId,
        mintTxHash: normalizedTxHash,
        mintedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedWarranty) {
      return sendError(res, {
        statusCode: 404,
        message: "Không tìm thấy phiếu bảo hành",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật bằng chứng mint thành công",
      data: updatedWarranty,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        message: "tokenId hoặc mintTxHash đã tồn tại",
      });
    }

    if (error && error.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        message: "Dữ liệu cập nhật mint không hợp lệ",
        details: Object.values(error.errors || {}).map((e) => e.message),
      });
    }

    console.error("updateMintInfo error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const getAllWarranties = async (req, res) => {
  try {
    const { status } = req.query || {};
    const filter = {};

    if (status !== undefined) {
      const normalizedStatus = String(status).trim().toLowerCase();

      if (normalizedStatus === "pending") {
        filter.tokenId = null;
      } else if (normalizedStatus === "minted") {
        filter.tokenId = { $type: "string" };
      } else if (normalizedStatus === "true" || normalizedStatus === "false") {
        filter.status = normalizedStatus === "true";
      } else {
        return sendError(res, {
          statusCode: 400,
          message: "status không hợp lệ. Hỗ trợ: pending, minted, true, false",
        });
      }
    }

    const warranties = await Warranty.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách phiếu bảo hành thành công",
      data: warranties,
    });
  } catch (error) {
    console.error("getAllWarranties error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const getWarrantyByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        statusCode: 400,
        message: "id không hợp lệ",
      });
    }

    const warranty = await Warranty.findById(id).lean();

    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        message: "Không tìm thấy phiếu bảo hành",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy chi tiết phiếu bảo hành thành công",
      data: warranty,
    });
  } catch (error) {
    console.error("getWarrantyByIdAdmin error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const updateWarrantyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        statusCode: 400,
        message: "id không hợp lệ",
      });
    }

    if (typeof status !== "boolean") {
      return sendError(res, {
        statusCode: 400,
        message: "status phải là boolean (true/false)",
      });
    }

    const updatedWarranty = await Warranty.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!updatedWarranty) {
      return sendError(res, {
        statusCode: 404,
        message: "Không tìm thấy phiếu bảo hành",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật trạng thái phiếu bảo hành thành công",
      data: updatedWarranty,
    });
  } catch (error) {
    console.error("updateWarrantyStatus error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const getMyWarranties = async (req, res) => {
  try {
    if (!req.user || !req.user.walletAddress) {
      return sendError(res, {
        statusCode: 401,
        message: "Thiếu thông tin người dùng từ token",
      });
    }

    const ownerAddress = String(req.user.walletAddress).trim().toLowerCase();

    const warranties = await Warranty.find({ ownerAddress })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách bảo hành của bạn thành công",
      data: warranties,
    });
  } catch (error) {
    console.error("getMyWarranties error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const verifyWarrantyBySerialNumber = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const normalizedSerialNumber = String(serialNumber || "").trim();

    if (!normalizedSerialNumber) {
      return sendError(res, {
        statusCode: 400,
        message: "serialNumber là bắt buộc",
      });
    }

    const warranty = await Warranty.findOne({
      serialNumber: normalizedSerialNumber,
    }).lean();

    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        message: "Không tìm thấy phiếu bảo hành cho serialNumber này",
      });
    }

    const owner = String(warranty.ownerAddress || "").trim();
    const maskedOwnerAddress =
      owner.length > 10
        ? `${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}`
        : owner;

    return sendSuccess(res, {
      statusCode: 200,
      message: "Tra cứu bảo hành thành công",
      data: {
        serialNumber: warranty.serialNumber,
        serialHash: warranty.serialHash,
        ownerAddress: maskedOwnerAddress,
        productCode: warranty.productCode,
        productInfo: warranty.productInfo,
        expiryDate: warranty.expiryDate,
        status: warranty.status,
        tokenId: warranty.tokenId,
        mintTxHash: warranty.mintTxHash,
        mintedAt: warranty.mintedAt,
        isMinted: Boolean(warranty.tokenId && warranty.mintTxHash),
      },
    });
  } catch (error) {
    console.error("verifyWarrantyBySerialNumber error:", error);
    return sendError(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createWarranty,
  updateMintInfo,
  getAllWarranties,
  getWarrantyByIdAdmin,
  updateWarrantyStatus,
  getMyWarranties,
  verifyWarrantyBySerialNumber,
};
