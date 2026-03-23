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
    fullName: user.fullName || "",
    email: user.email,
    phone: user.phone || "",
  };

  // Contract sample includes timestamps only in selected endpoints.
  if (includeCreatedAt) safeUser.createdAt = user.createdAt;
  if (includeUpdatedAt) safeUser.updatedAt = user.updatedAt;

  return safeUser;
};

// POST /api/users/auth
const upsertUserByWallet = async (req, res, next) => {
  try {
    const { walletAddress, fullName, email, phone } = req.body;

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "walletAddress is required",
        details: ["walletAddress"],
      });
    }

    const wallet = normalizeWallet(walletAddress);

    let user = await User.findOne({ walletAddress: wallet });
    let statusCode = 200;

    if (!user) {
      user = new User({
        walletAddress: wallet,
        fullName: fullName ? fullName.trim() : "",
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone ? phone.trim() : "",
      });
      await user.save();
      statusCode = 201;
    }

    // Security hardening: issue JWT via header while keeping body shape per contract.
    const token = generateToken(user);
    res.setHeader("Authorization", `Bearer ${token}`);
    res.setHeader("x-access-token", token);

    return sendSuccess(res, {
      statusCode,
      message: "User authenticated",
      data: toUserResponse(user, {
        includeCreatedAt: true,
        includeUpdatedAt: true,
      }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        errorCode: "E409_DUPLICATE",
        message: "walletAddress or email already exists",
      });
    }
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
        message: "walletAddress is required",
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
        message: "You can only access your own profile",
      });
    }

    const user = await User.findOne({ walletAddress: wallet });
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "User not found",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "User found",
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
        message: "walletAddress is required",
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
        message: "You can only update your own profile",
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
        message: "No fields to update",
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
        message: "User not found",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "User updated",
      data: toUserResponse(user, { includeUpdatedAt: true }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        errorCode: "E409_DUPLICATE",
        message: "email already exists",
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
      message: "Users retrieved",
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
