const mongoose = require("mongoose");
const Warranty = require("../models/WarrantyModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// POST /api/warranties - Tạo phiếu bảo hành mới
const createWarranty = async (req, res) => {
  try {
    const {
      tokenId,
      serialNumber,
      serialHash,
      ownerAddress,
      productCode,
      productInfo,
      expiryDate,
      mintTxHash,
      mintedAt,
    } = req.body;

    if (
      !tokenId ||
      !serialNumber ||
      !serialHash ||
      !ownerAddress ||
      !productCode
    ) {
      return sendError(res, {
        statusCode: 400,
        error:
          "tokenId, serialNumber, serialHash, ownerAddress, and productCode are required",
      });
    }

    // Kiểm tra tokenId hoặc serialNumber đã tồn tại
    const existingToken = await Warranty.findOne({ tokenId: tokenId.trim() });
    if (existingToken) {
      return sendError(res, {
        statusCode: 409,
        error: "tokenId already exists",
      });
    }

    const existingSerial = await Warranty.findOne({
      serialNumber: serialNumber.trim(),
    });
    if (existingSerial) {
      return sendError(res, {
        statusCode: 409,
        error: "serialNumber already exists",
      });
    }

    const warranty = new Warranty({
      tokenId: tokenId.trim(),
      serialNumber: serialNumber.trim(),
      serialHash: serialHash.trim(),
      ownerAddress: ownerAddress.trim(),
      productCode: productCode.trim(),
      productInfo: productInfo || {},
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      mintTxHash: mintTxHash ? mintTxHash.trim() : undefined,
      mintedAt: mintedAt ? new Date(mintedAt) : undefined,
    });

    const savedWarranty = await warranty.save();

    sendSuccess(res, {
      statusCode: 201,
      message: "Warranty created successfully",
      data: savedWarranty,
    });
  } catch (error) {
    console.error("Error creating warranty:", error);
    sendError(res, {
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

// GET /api/warranties/:tokenId - Lấy chi tiết phiếu bảo hành theo tokenId
const getWarrantyByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return sendError(res, {
        statusCode: 400,
        error: "tokenId is required",
      });
    }

    const warranty = await Warranty.findOne({ tokenId: tokenId.trim() });

    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        error: "Warranty not found",
      });
    }

    sendSuccess(res, {
      statusCode: 200,
      message: "Warranty retrieved successfully",
      data: warranty,
    });
  } catch (error) {
    console.error("Error retrieving warranty:", error);
    sendError(res, {
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

// GET /api/warranties/owner/:ownerAddress - Lấy danh sách phiếu bảo hành theo ownerAddress
const getWarrantiesByOwner = async (req, res) => {
  try {
    const { ownerAddress } = req.params;

    if (!ownerAddress) {
      return sendError(res, {
        statusCode: 400,
        error: "ownerAddress is required",
      });
    }

    const warranties = await Warranty.find({
      ownerAddress: ownerAddress.trim(),
    });

    sendSuccess(res, {
      statusCode: 200,
      message: "Warranties retrieved successfully",
      data: warranties,
    });
  } catch (error) {
    console.error("Error retrieving warranties:", error);
    sendError(res, {
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

// GET /api/warranties - Lấy tất cả phiếu bảo hành (cho Admin)
const getAllWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find({});

    sendSuccess(res, {
      statusCode: 200,
      message: "All warranties retrieved successfully",
      data: warranties,
    });
  } catch (error) {
    console.error("Error retrieving warranties:", error);
    sendError(res, {
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

// PUT /api/warranties/:tokenId - Cập nhật trạng thái phiếu bảo hành
const updateWarranty = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status, ownerAddress, expiryDate, productInfo } = req.body;

    if (!tokenId) {
      return sendError(res, {
        statusCode: 400,
        error: "tokenId is required",
      });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (ownerAddress) updateData.ownerAddress = ownerAddress.trim();
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (productInfo) updateData.productInfo = productInfo;

    const warranty = await Warranty.findOneAndUpdate(
      { tokenId: tokenId.trim() },
      updateData,
      { new: true, runValidators: true },
    );

    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        error: "Warranty not found",
      });
    }

    sendSuccess(res, {
      statusCode: 200,
      message: "Warranty updated successfully",
      data: warranty,
    });
  } catch (error) {
    console.error("Error updating warranty:", error);
    sendError(res, {
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

module.exports = {
  createWarranty,
  getWarrantyByTokenId,
  getWarrantiesByOwner,
  getAllWarranties,
  updateWarranty,
};
