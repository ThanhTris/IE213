const crypto = require("crypto");
const mongoose = require("mongoose");
const Warranty = require("../models/WarrantyModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const TransferHistory = require("../models/TranferHistoryModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { uploadFileToPinata, uploadJSONToPinata } = require("../utils/pinata");

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

// POST /api/warranties — nhận multipart/form-data, tích hợp Pinata IPFS
const createWarranty = async (req, res) => {
  try {
    // Zero-trust whitelist: chỉ nhận đúng các field được phép từ client.
    const { serialNumber, productCode, ownerWallet, warrantyMonths } = req.body || {};

    if (!serialNumber || !productCode || !ownerWallet) {
      return sendError(res, {
        statusCode: 400,
        message: "serialNumber, productCode, ownerWallet là bắt buộc",
      });
    }

    const normalizedOwnerWallet = String(ownerWallet).trim().toLowerCase();
    if (!EVM_ADDRESS_REGEX.test(normalizedOwnerWallet)) {
      return sendError(res, {
        statusCode: 400,
        message: "ownerWallet không đúng định dạng ví EVM",
      });
    }

    const normalizedSerialNumber = String(serialNumber).trim();
    const normalizedProductCode = String(productCode).trim().toUpperCase();

    // Kiểm tra khách hàng tồn tại trong hệ thống
    const customer = await User.findOne({
      walletAddress: normalizedOwnerWallet,
    }).lean();

    if (!customer) {
      return sendError(res, {
        statusCode: 404,
        message:
          "Khách hàng chưa có trong hệ thống. Vui lòng đăng ký tài khoản cho khách trước!",
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({
      productCode: normalizedProductCode,
    }).lean();

    if (!product) {
      return sendError(res, {
        statusCode: 404,
        message: "Mã sản phẩm không tồn tại!",
      });
    }

    // Kiểm tra serialNumber chưa được dùng
    const existedWarranty = await Warranty.findOne({
      serialNumber: normalizedSerialNumber,
    }).lean();
    if (existedWarranty) {
      return sendError(res, {
        statusCode: 409,
        message: "serialNumber đã tồn tại trong hệ thống bảo hành",
      });
    }

    // Tự động tính serialHash từ serialNumber
    const serialHash = `0x${crypto
      .createHash("sha256")
      .update(normalizedSerialNumber)
      .digest("hex")}`;

    // Tính ngày hết hạn bảo hành
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const monthsFromProduct = Number(product.warrantyMonths) || 0;
    const requestedMonths =
      typeof warrantyMonths !== "undefined"
        ? Number(warrantyMonths)
        : monthsFromProduct;

    if (Number.isNaN(requestedMonths) || requestedMonths < 0) {
      return sendError(res, {
        statusCode: 400,
        message: "warrantyMonths không hợp lệ",
      });
    }

    const expiryDate = nowInSeconds + requestedMonths * 30 * 24 * 60 * 60;

    // -------------------------------------------------------
    // BƯỚC 1: XỬ LÝ ẢNH — Upload mới hoặc lấy từ Product
    // -------------------------------------------------------
    let imageCIDUrl = null; // ipfs://<CID> hoặc http URL

    if (req.file && process.env.PINATA_JWT) {
      // Có ảnh mới => upload lên Pinata
      try {
        const imageCID = await uploadFileToPinata(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        imageCIDUrl = `ipfs://${imageCID}`;
        console.log(`[Pinata] Ảnh warranty ${normalizedSerialNumber} uploaded: ${imageCIDUrl}`);
      } catch (ipfsError) {
        console.error("[Pinata] Upload ảnh thất bại:", ipfsError.message);
        return sendError(res, {
          statusCode: 502,
          errorCode: "E502_IPFS",
          message: `Upload ảnh lên IPFS thất bại: ${ipfsError.message}`,
        });
      }
    } else {
      // Không có ảnh mới => dùng imageUrl mặc định từ Product
      imageCIDUrl = product.imageUrl || null;
      console.log(`[Pinata] Không có ảnh mới, dùng imageUrl từ Product: ${imageCIDUrl}`);
    }

    // -------------------------------------------------------
    // BƯỚC 2: TẠO NFT METADATA JSON & UPLOAD LÊN PINATA
    // -------------------------------------------------------
    let tokenURI = null;

    if (process.env.PINATA_JWT) {
      try {
        const metadataJSON = {
          name: `Warranty Card - ${normalizedSerialNumber}`,
          description: `E-Warranty for ${product.productName} by ${product.brand}. ${product.description || ""}`.trim(),
          image: imageCIDUrl || "",
          attributes: [
            { trait_type: "Serial Number", value: normalizedSerialNumber },
            { trait_type: "Product Code", value: normalizedProductCode },
            { trait_type: "Product Name", value: product.productName },
            { trait_type: "Brand", value: product.brand },
            { trait_type: "Color", value: product.color || "" },
            { trait_type: "Config", value: product.config || "" },
            {
              trait_type: "Expiry Date",
              display_type: "date",
              value: expiryDate,
            },
            { trait_type: "Owner Wallet", value: normalizedOwnerWallet },
            {
              trait_type: "Warranty Months",
              value: requestedMonths,
            },
          ],
        };

        const jsonCID = await uploadJSONToPinata(
          metadataJSON,
          `warranty_${normalizedSerialNumber}.json`,
        );
        tokenURI = `ipfs://${jsonCID}`;
        console.log(`[Pinata] Metadata warranty ${normalizedSerialNumber} uploaded: ${tokenURI}`);
      } catch (ipfsError) {
        console.error("[Pinata] Upload metadata JSON thất bại:", ipfsError.message);
        // Không hard-fail metadata upload: vẫn lưu warranty nhưng không có tokenURI
        tokenURI = null;
      }
    }

    // -------------------------------------------------------
    // BƯỚC 3: LƯU VÀO DB
    // -------------------------------------------------------
    const warranty = new Warranty({
      serialNumber: normalizedSerialNumber,
      serialHash,
      ownerWallet: normalizedOwnerWallet,
      productCode: normalizedProductCode,
      expiryDate,
      status: true,
      tokenURI,
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

    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// PATCH /api/warranties/:id — Cập nhật thông tin On-chain sau khi mint NFT
const updateMintInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { tokenId, txHash, tokenURI, status } = req.body || {};

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

    // Xác định trạng thái status
    let updateStatus = true;
    if (status !== undefined) {
      updateStatus = typeof status === "string" ? status.toLowerCase() === "true" || status.toLowerCase() === "active" : Boolean(status);
    }

    const updatedWarranty = await Warranty.findByIdAndUpdate(
      id,
      {
        tokenId: normalizedTokenId,
        txHash: normalizedTxHash,
        ...(tokenURI && { tokenURI: String(tokenURI).trim() }),
        mintedAt: new Date(),
        status: updateStatus,
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

    // Tự động tạo transfer history mint (0x0 → ownerWallet)
    try {
      await TransferHistory.create({
        tokenId: normalizedTokenId,
        serialNumber: updatedWarranty.serialNumber,
        fromAddress: "0x0000000000000000000000000000000000000000",
        toAddress: updatedWarranty.ownerWallet,
        txHash: normalizedTxHash,
        transferType: "mint",
      });
    } catch (err) {
      return sendError(res, {
        statusCode: 500,
        message:
          "Đã cập nhật mint (txHash được giữ nguyên) nhưng tạo lịch sử chuyển nhượng thất bại",
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

// GET /api/warranties — Lấy tất cả (admin/staff)
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

// GET /api/warranties/:id — Chi tiết (admin/staff)
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

// PATCH /api/warranties/:id/status — Đổi trạng thái (admin/staff)
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

// GET /api/warranties/my-warranties — Lấy bảo hành của user đang login
const getMyWarranties = async (req, res) => {
  try {
    if (!req.user || !req.user.walletAddress) {
      return sendError(res, {
        statusCode: 401,
        message: "Thiếu thông tin người dùng từ token",
      });
    }

    const ownerWallet = String(req.user.walletAddress).trim().toLowerCase();

    const warranties = await Warranty.find({ ownerWallet })
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

// GET /api/warranties/verify/:serialNumber — Tra cứu công khai
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

    const owner = String(warranty.ownerWallet || "").trim();
    const maskedOwnerWallet =
      owner.length > 10
        ? `${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}`
        : owner;

    return sendSuccess(res, {
      statusCode: 200,
      message: "Tra cứu bảo hành thành công",
      data: {
        serialNumber: warranty.serialNumber,
        serialHash: warranty.serialHash,
        ownerWallet: maskedOwnerWallet,
        productCode: warranty.productCode,
        expiryDate: warranty.expiryDate,
        status: warranty.status,
        tokenId: warranty.tokenId,
        tokenURI: warranty.tokenURI,
        txHash: warranty.txHash,
        mintedAt: warranty.mintedAt,
        isMinted: Boolean(warranty.tokenId && warranty.txHash),
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
