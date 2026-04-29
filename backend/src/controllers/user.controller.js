const User = require("../models/UserModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { generateToken } = require("../middleware/auth");

const normalizeWallet = (walletAddress = "") =>
  walletAddress.trim().toLowerCase();

const toUserResponse = (user, options = {}) => {
  const { includeCreatedAt = true, includeUpdatedAt = false } = options;
  const safeUser = {
    _id: user._id,
    walletAddress: user.walletAddress,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  };

  if (includeCreatedAt) safeUser.createdAt = user.createdAt;
  if (includeUpdatedAt) safeUser.updatedAt = user.updatedAt;

  return safeUser;
};

const toPrivilegedUserResponse = (user, options = {}) => {
  const safeUser = toUserResponse(user, options);
  safeUser.role = user.role;
  safeUser.isActive = user.isActive;
  safeUser.notificationSettings = user.notificationSettings;
  return safeUser;
};

const normalizeEmail = (email = "") => {
  const trimmed = String(email).trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
};

const normalizeText = (value = "") => {
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
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
      // DEMO_MODE=true → cấp role staff để demo dashboard/workspace
      // Tắt bằng cách đổi DEMO_MODE=false trên Render Dashboard
      const defaultRole = process.env.DEMO_MODE === "true" ? "staff" : "user";
      user = new User({
        walletAddress: wallet,
        fullName: "Người dùng mới",
        role: defaultRole,
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

// GET /api/users/me
const getUserByWallet = async (req, res, next) => {
  try {
    const walletAddress = normalizeWallet(req.user?.walletAddress || "");

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Không tìm thấy thông tin người dùng trong token",
        details: ["walletAddress"],
      });
    }

    const user = await User.findOne({ walletAddress });
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

// PUT /api/users/me
const updateMyProfile = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const walletAddress = normalizeWallet(req.user?.walletAddress || "");

    const forbiddenProfileFields = ["role"];
    const forbiddenField = Object.keys(payload).find((key) =>
      forbiddenProfileFields.includes(String(key).toLowerCase()),
    );

    if (forbiddenField) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không được phép cập nhật role ở endpoint này",
        details: [forbiddenField],
      });
    }

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 401,
        errorCode: "E401_UNAUTHORIZED",
        message: "Không tìm thấy thông tin người dùng trong token",
        details: ["walletAddress"],
      });
    }

    const updates = {};

    const fullNameValue =
      payload.fullName !== undefined ? payload.fullName : payload.fullname;
    if (fullNameValue !== undefined) {
      updates.fullName = normalizeText(fullNameValue);
    }

    if (payload.email !== undefined) {
      updates.email = normalizeEmail(payload.email);
    }

    if (payload.phone !== undefined) {
      updates.phone = normalizeText(payload.phone);
    }

    if (payload.isActive !== undefined) {
      updates.isActive = Boolean(payload.isActive);
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có dữ liệu để cập nhật",
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
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

// PUT /api/users/:walletAddress (Admin/Staff/Technician)
const updateUserByWallet = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const walletAddress = normalizeWallet(req.params.walletAddress || "");

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    const updates = {};

    if (payload.role !== undefined) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không được phép cập nhật role ở endpoint này",
        details: ["role"],
      });
    }

    const fullNameValue =
      payload.fullName !== undefined ? payload.fullName : payload.fullname;
    if (fullNameValue !== undefined) {
      updates.fullName = normalizeText(fullNameValue);
    }

    if (payload.email !== undefined) {
      updates.email = normalizeEmail(payload.email);
    }

    if (payload.phone !== undefined) {
      updates.phone = normalizeText(payload.phone);
    }

    if (payload.isActive !== undefined || payload.isactive !== undefined) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "isActive phải cập nhật qua API riêng",
        details: ["isActive"],
      });
    }

    if (payload.notificationSettings !== undefined) {
      updates.notificationSettings = payload.notificationSettings;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có dữ liệu để cập nhật",
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
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
      data: toPrivilegedUserResponse(user, { includeUpdatedAt: true }),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map(err => err.message);
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Dữ liệu không hợp lệ: " + details.join(", "),
        details
      });
    }
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        errorCode: "E409_DUPLICATE",
        message: "Email hoặc địa chỉ ví đã tồn tại",
        details: ["email"],
      });
    }
    return next(error);
  }
};

// PATCH /api/users/:walletAddress/role (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const walletAddress = normalizeWallet(req.params.walletAddress || "");
    const role = String(req.body?.role || "").trim().toLowerCase();

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    if (!role) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "role là trường bắt buộc",
        details: ["role"],
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
      { $set: { role } },
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
      message: "Cập nhật role thành công",
      data: toPrivilegedUserResponse(user, { includeUpdatedAt: true }),
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/users/:walletAddress/is-active
const updateUserIsActive = async (req, res, next) => {
  try {
    const walletAddress = normalizeWallet(req.params.walletAddress || "");
    const { isActive } = req.body || {};
    const actorRole = req.user?.role;
    const actorWallet = normalizeWallet(req.user?.walletAddress || "");

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    if (typeof isActive !== "boolean") {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "isActive phải là boolean",
        details: ["isActive"],
      });
    }

    const privilegedRoles = ["admin", "staff", "technician"];
    const isPrivileged = privilegedRoles.includes(actorRole);
    const isSelfAction = actorWallet && actorWallet === walletAddress;

    if (!isPrivileged && !(actorRole === "user" && isSelfAction)) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn không có quyền cập nhật isActive cho người dùng này",
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
      { $set: { isActive } },
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
      message: "Cập nhật trạng thái isActive thành công",
      data: toPrivilegedUserResponse(user, { includeUpdatedAt: true }),
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/users/:walletAddress (Admin only)
const getUserByWalletAddressForAdmin = async (req, res, next) => {
  try {
    const walletAddress = normalizeWallet(req.params.walletAddress || "");

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress là trường bắt buộc",
        details: ["walletAddress"],
      });
    }

    const user = await User.findOne({ walletAddress });
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
      data: toPrivilegedUserResponse(user, {
        includeCreatedAt: true,
        includeUpdatedAt: true,
      }),
    });
  } catch (error) {
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
      data: users.map((user) =>
        toPrivilegedUserResponse(user, {
          includeCreatedAt: true,
          includeUpdatedAt: true,
        }),
      ),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertUserByWallet,
  getUserByWallet,
  updateMyProfile,
  updateUserByWallet,
  updateUserRole,
  updateUserIsActive,
  getUserByWalletAddressForAdmin,
  getAllUsers,
};
