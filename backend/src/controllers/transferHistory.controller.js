const mongoose = require("mongoose");
const Warranty = require("../models/WarrantyModel");
const TransferHistory = require("../models/TranferHistoryModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

// POST /api/transfers - user initiated transfer between wallets
const createTransfer = async (req, res) => {
  try {
    const { tokenId, toAddress, txHash } = req.body || {};

    if (!tokenId || !toAddress || !txHash) {
      return sendError(res, {
        statusCode: 400,
        message: "tokenId, toAddress và txHash là bắt buộc",
      });
    }

    const senderWallet = req.user && req.user.walletAddress;
    if (!senderWallet) {
      return sendError(res, {
        statusCode: 401,
        message: "Thiếu thông tin người gửi từ token",
      });
    }

    const normalizedTokenId = String(tokenId).trim();
    const normalizedTo = String(toAddress).trim().toLowerCase();
    const normalizedTxHash = String(txHash).trim().toLowerCase();
    const normalizedSender = String(senderWallet).trim().toLowerCase();

    if (!EVM_ADDRESS_REGEX.test(normalizedTo)) {
      return sendError(res, {
        statusCode: 400,
        message: "toAddress không đúng định dạng ví EVM",
      });
    }

    if (!EVM_TX_HASH_REGEX.test(normalizedTxHash)) {
      return sendError(res, {
        statusCode: 400,
        message: "txHash không đúng định dạng",
      });
    }

    // Find warranty by tokenId
    const warranty = await Warranty.findOne({ tokenId: normalizedTokenId });
    if (!warranty) {
      return sendError(res, {
        statusCode: 404,
        message: "Không tìm thấy NFT/Warranty tương ứng với tokenId",
      });
    }

    // Ownership check
    if (String(warranty.ownerAddress).toLowerCase() !== normalizedSender) {
      return sendError(res, {
        statusCode: 403,
        message: "Bạn không phải chủ sở hữu NFT này, không có quyền chuyển!",
      });
    }

    // Perform update and create transfer history
    try {
      // Inputs and warranty found — no debug logging in production
      // Update warranty owner
      const updatedWarranty = await Warranty.findByIdAndUpdate(
        warranty._id,
        { ownerAddress: normalizedTo },
        { new: true, runValidators: true },
      );

      // create transfer history record
      const th = await TransferHistory.create({
        tokenId: normalizedTokenId,
        serialNumber: warranty.serialNumber,
        fromAddress: normalizedSender,
        toAddress: normalizedTo,
        txHash: normalizedTxHash,
        transferType: "transfer",
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: "Chuyển nhượng thành công",
        data: { warranty: updatedWarranty, transferHistory: th },
      });
    } catch (err) {
      if (err && err.code === 11000) {
        // duplicate key, most likely txHash unique constraint
        return sendError(res, {
          statusCode: 409,
          message: "Giao dịch (txHash) đã tồn tại trong lịch sử chuyển nhượng",
        });
      }

      return sendError(res, {
        statusCode: 500,
        message: "Lỗi khi thực hiện chuyển nhượng",
      });
    }
  } catch (error) {
    // Error occurred — no console output per request
    return sendError(res, {
      statusCode: 500,
      message: "Lỗi nội bộ máy chủ",
    });
  }
};

// Admin/staff helper: lookup transfer by txHash
const getByTxHash = async (req, res) => {
  try {
    const { txHash } = req.params;
    if (!txHash) {
      return sendError(res, { statusCode: 400, message: "txHash là bắt buộc" });
    }

    const normalizedTx = String(txHash).trim().toLowerCase();
    if (!EVM_TX_HASH_REGEX.test(normalizedTx)) {
      return sendError(res, {
        statusCode: 400,
        message: "txHash không đúng định dạng",
      });
    }

    const th = await TransferHistory.findOne({ txHash: normalizedTx }).lean();
    if (!th) {
      return sendError(res, {
        statusCode: 404,
        message: "Không tìm thấy txHash trong lịch sử chuyển nhượng",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      data: th,
      message: "Lấy chi tiết giao dịch thành công",
    });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: "Lỗi nội bộ máy chủ" });
  }
};

// Public: GET transfer history list by tokenId
const getByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;
    if (!tokenId) {
      return sendError(res, {
        statusCode: 400,
        message: "tokenId là bắt buộc",
      });
    }

    const normalizedToken = String(tokenId).trim();

    // Return all transfer history entries for the token ordered by transferDate desc
    const list = await TransferHistory.find({ tokenId: normalizedToken })
      .sort({ transferDate: -1 })
      .lean();

    return sendSuccess(res, {
      statusCode: 200,
      data: list,
      message: "Lấy danh sách lịch sử chuyển nhượng thành công",
    });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: "Lỗi nội bộ máy chủ" });
  }
};

module.exports = {
  createTransfer,
  getByTxHash,
  getByTokenId,
};
