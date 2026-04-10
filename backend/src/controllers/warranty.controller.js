const crypto = require("crypto");
const mongoose = require("mongoose");
const Warranty = require("../models/WarrantyModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const TransferHistory = require("../models/TranferHistoryModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

const createWarranty = async (req, res) => {
  try {
    // Zero-trust whitelist: chỉ nhận đúng các field được phép từ client.
    const { serialNumber, productCode, ownerAddress, warrantyMonths, tokenURI } = req.body || {};

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
    // Allow overriding warranty months via request (optional). Fall back to product config.
    const monthsFromProduct = Number(product.warrantyMonths) || 0;
    const requestedMonths = typeof warrantyMonths !== "undefined" ? Number(warrantyMonths) : monthsFromProduct;
    if (Number.isNaN(requestedMonths) || requestedMonths < 0) {
      return sendError(res, {
        statusCode: 400,
        message: "warrantyMonths không hợp lệ",
      });
    }

    const expiryDate = nowInSeconds + requestedMonths * 30 * 24 * 60 * 60;

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
      tokenURI: tokenURI ? String(tokenURI).trim() : null,
    });

    // ---------------------------------------------------------
    // WEB3: AUTO UPLOAD METADATA TO IPFS (PINATA)
    // ---------------------------------------------------------
    if (!warranty.tokenURI && process.env.PINATA_JWT) {
      try {
        const metadataJSON = {
          name: `Warranty Card - ${warranty.serialNumber}`,
          description: `E-Warranty for ${warranty.productInfo.productName} by ${warranty.productInfo.brand}`,
          attributes: [
            { trait_type: "Serial Number", value: warranty.serialNumber },
            { trait_type: "Product Code", value: warranty.productCode },
            { trait_type: "Brand", value: warranty.productInfo.brand },
            { trait_type: "Color", value: warranty.productInfo.color },
            { trait_type: "Expiry Date", display_type: "date", value: warranty.expiryDate },
            { trait_type: "Owner", value: warranty.ownerAddress }
          ]
        };

        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
          body: JSON.stringify({
            pinataContent: metadataJSON,
            pinataMetadata: {
              name: `warranty_${warranty.serialNumber}.json`,
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          warranty.tokenURI = `ipfs://${result.IpfsHash}`;
        } else {
          console.error("[IPFS] Pinata upload failed:", await response.text());
        }
      } catch (ipfsError) {
        console.error("[IPFS] Error uploading to Pinata:", ipfsError.message);
      }
    }

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

    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

const updateMintInfo = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept tokenId and txHash per API spec
    const { tokenId, txHash, tokenURI } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, {
        statusCode: 400,
        message: "id không hợp lệ",
      });
    }

    if (!tokenId || !txHash) {
      return sendError(res, {
        statusCode: 400,
        message: "tokenId và txHash là bắt buộc",
      });
    }

    const normalizedTokenId = String(tokenId).trim();
    const normalizedTxHash = String(txHash).trim().toLowerCase();

    if (!EVM_TX_HASH_REGEX.test(normalizedTxHash)) {
      return sendError(res, {
        statusCode: 400,
        message: "txHash không đúng định dạng tx hash",
      });
    }

    const updatedWarranty = await Warranty.findByIdAndUpdate(
      id,
      {
        tokenId: normalizedTokenId,
        mintTxHash: normalizedTxHash,
        ...(tokenURI && { tokenURI: String(tokenURI).trim() }),
        mintedAt: new Date(),
        status: true,
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

    // Create transfer history for mint (zero address -> customer)
    try {
      await TransferHistory.create({
        tokenId: normalizedTokenId,
        serialNumber: updatedWarranty.serialNumber,
        fromAddress: "0x0000000000000000000000000000000000000000",
        toAddress: updatedWarranty.ownerAddress,
        txHash: normalizedTxHash,
        transferType: "mint",
      });
    } catch (err) {
      // If creating transfer history fails, do NOT remove mintTxHash (birth record).
      // Warranty remains minted; transfer history must be created manually or retried.
      return sendError(res, {
        statusCode: 500,
        message:
          "Đã cập nhật mint (mintTxHash được giữ nguyên) nhưng tạo lịch sử chuyển nhượng thất bại",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật mint và tạo lịch sử chuyển nhượng (mint) thành công",
      data: updatedWarranty,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        message: "tokenId hoặc txHash đã tồn tại",
      });
    }

    if (error && error.name === "ValidationError") {
      return sendError(res, {
        statusCode: 400,
        message: "Dữ liệu cập nhật mint không hợp lệ",
        details: Object.values(error.errors || {}).map((e) => e.message),
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
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
    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
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
    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
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
    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
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
    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
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
        tokenURI: warranty.tokenURI,
        mintTxHash: warranty.mintTxHash,
        mintedAt: warranty.mintedAt,
        isMinted: Boolean(warranty.tokenId && warranty.mintTxHash),
      },
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
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
