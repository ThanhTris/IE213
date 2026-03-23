const User = require("../models/UserModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { generateToken } = require("../middleware/auth");

const normalizeWallet = (walletAddress = "") =>
  walletAddress.trim().toLowerCase();

const toUserResponse = (user, options = {}) => {
  const { includeCreatedAt = false, includeUpdatedAt = false } = options;
  const safeUser = {
    _id: user._id,
    walletAddress: user.walletAddress,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  };

  // Contract sample includes timestamps only in selected endpoints.
  if (includeCreatedAt) safeUser.createdAt = user.createdAt;
  if (includeUpdatedAt) safeUser.updatedAt = user.updatedAt;

  return safeUser;
};

// POST /api/users/auth
const upsertUserByWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body || {};
    const bodyKeys = Object.keys(req.body || {});

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    const invalidFields = bodyKeys.filter((key) => key !== "walletAddress");
    if (invalidFields.length > 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Chỉ được gửi walletAddress",
        details: invalidFields,
      });
    }

    const wallet = normalizeWallet(walletAddress);

    let user = await User.findOne({ walletAddress: wallet });
    let message = "Đăng nhập thành công";
    let statusCode = 200;

    if (!user) {
      user = new User({
        walletAddress: wallet,
        role: "user",
      });
      await user.save();
      message = "Đăng ký tài khoản thành công";
      statusCode = 201;
    }

    const accessToken = generateToken(user);
    const safeUser = user.toObject();
    delete safeUser.__v;

    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        user: safeUser,
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/users/me?walletAddress=...  (also supports JSON body)
const getUserByWallet = async (req, res, next) => {
  try {
    const walletAddress = req.query.walletAddress || req.body.walletAddress;
    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    const wallet = normalizeWallet(walletAddress);

    if (
      req.user &&
      req.user.role !== "admin" &&
      normalizeWallet(req.user.walletAddress || "") !== wallet
    ) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn chỉ có thể xem hồ sơ của chính mình",
      });
    }

    const user = await User.findOne({ walletAddress: wallet });
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy người dùng",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy thông tin người dùng thành công",
      data: toUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/users/:walletAddress
const updateUserByWallet = async (req, res, next) => {
  try {
    const walletAddress = req.params.walletAddress;
    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    const wallet = normalizeWallet(walletAddress);
    if (
      req.user &&
      req.user.role !== "admin" &&
      normalizeWallet(req.user.walletAddress || "") !== wallet
    ) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn chỉ có thể cập nhật hồ sơ của chính mình",
      });
    }

    const updates = {};
    const fields = ["fullName", "email", "phone"];

    fields.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== null) {
        updates[f] =
          f === "email" ? req.body[f].trim().toLowerCase() : req.body[f].trim();
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có dữ liệu để cập nhật",
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy người dùng",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật người dùng thành công",
      data: toUserResponse(user, { includeUpdatedAt: true }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        errorCode: "E409_DUPLICATE",
        message: "Email đã tồn tại",
        details: ["email"],
      });
    }
    return next(error);
  }
};

// GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách người dùng thành công",
      data: users.map((user) => toUserResponse(user)),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertUserByWallet,
  getUserByWallet,
  updateUserByWallet,
  getAllUsers,
};
