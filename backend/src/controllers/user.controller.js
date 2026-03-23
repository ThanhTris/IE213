const User = require("../models/UserModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// POST /api/users/auth
const upsertUserByWallet = async (req, res) => {
  try {
    const { walletAddress, fullName, email, phone } = req.body;

    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        error: "walletAddress is required",
      });
    }

    const wallet = walletAddress.trim().toLowerCase();

    let user = await User.findOne({ walletAddress: wallet });

    if (!user) {
      // register
      user = new User({
        walletAddress: wallet,
        fullName: fullName ? fullName.trim() : "",
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone ? phone.trim() : "",
      });

      console.log("[upsertUserByWallet] Creating user:", {
        wallet,
        fullName,
        email,
        phone,
      });

      try {
        await user.save();
        console.log("[upsertUserByWallet] User saved successfully:", user._id);
      } catch (saveError) {
        console.error(
          "[upsertUserByWallet] Save failed:",
          saveError.message,
          saveError.errors,
        );
        throw saveError;
      }

      return sendSuccess(res, {
        statusCode: 201,
        message: "User registered successfully",
        data: user,
      });
    }

    // login
    return sendSuccess(res, {
      statusCode: 200,
      message: "User exists",
      data: user,
    });
  } catch (error) {
    console.error("[upsertUserByWallet]", error);
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        error: "Duplicate wallet or email exists",
      });
    }
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// GET /api/users/me?walletAddress=...  (also supports JSON body)
const getUserByWallet = async (req, res) => {
  try {
    const walletAddress = req.query.walletAddress || req.body.walletAddress;
    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        error: "walletAddress is required (query or body)",
      });
    }

    const wallet = walletAddress.trim().toLowerCase();

    const user = await User.findOne({ walletAddress: wallet }).select("-__v");
    if (!user) {
      return sendError(res, { statusCode: 404, error: "User not found" });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "User found",
      data: user,
    });
  } catch (error) {
    console.error("[getUserByWallet]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// PUT /api/users/:walletAddress
const updateUserByWallet = async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    if (!walletAddress) {
      return sendError(res, {
        statusCode: 400,
        error: "walletAddress is required",
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
        error: "No fields to update",
      });
    }

    const wallet = walletAddress.trim().toLowerCase();
    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-__v");

    if (!user) {
      return sendError(res, { statusCode: 404, error: "User not found" });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("[updateUserByWallet]", error);
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        error: "Email already exists",
      });
    }
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    return sendSuccess(res, {
      statusCode: 200,
      message: "Users retrieved",
      data: users,
    });
  } catch (error) {
    console.error("[getAllUsers]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

module.exports = {
  upsertUserByWallet,
  getUserByWallet,
  updateUserByWallet,
  getAllUsers,
};
