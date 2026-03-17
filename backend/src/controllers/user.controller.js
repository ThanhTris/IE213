const User = require("../models/UserModel");

const handleError = require("../utils/errorHandler");
const handleSuccess = require("../utils/successHandler");

// POST /api/users/auth
const upsertUserByWallet = async (req, res) => {
  try {
    const { walletAddress, fullName, email, phone } = req.body;

    if (!walletAddress) {
      return handleError(res, "walletAddress is required", 400);
    }

    const wallet = walletAddress.trim().toLowerCase();

    let user = await User.findOne({ walletAddress: wallet });

    if (!user) {
      // register
      user = new User({
        walletAddress: wallet,
        fullName: fullName ? fullName.trim() : "",
        email: email ? email.trim().toLowerCase() : "",
        phone: phone ? phone.trim() : "",
      });

      await user.save();
      return handleSuccess(res, "User registered successfully", user);
    }

    // login
    return handleSuccess(res, "User exists", user);
  } catch (error) {
    console.error("[userAuth]", error);
    if (error.code === 11000) {
      return handleError(res, "Duplicate wallet or email exists", 409);
    }
    return handleError(res, "Server error", 500);
  }
};

// GET /api/users/me?walletAddress=...
const getUserByWallet = async (req, res) => {
  try {
    const walletAddress = req.query.walletAddress;
    if (!walletAddress) {
      return handleError(res, "walletAddress query is required", 400);
    }

    const wallet = walletAddress.trim().toLowerCase();

    const user = await User.findOne({ walletAddress: wallet }).select("-__v");
    if (!user) return handleError(res, "User not found", 404);

    return handleSuccess(res, "User found", user);
  } catch (error) {
    console.error("[getUserByWallet]", error);
    return handleError(res, "Server error", 500);
  }
};

// PUT /api/users/:walletAddress
const updateUserByWallet = async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    if (!walletAddress) {
      return handleError(res, "walletAddress is required", 400);
    }

    const updates = {};
    const fields = ["fullName", "email", "phone"];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates[f] =
          f === "email" ? req.body[f].trim().toLowerCase() : req.body[f].trim();
      }
    });

    if (Object.keys(updates).length === 0) {
      return handleError(res, "No fields to update", 400);
    }

    const wallet = walletAddress.trim().toLowerCase();
    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-__v");

    if (!user) return handleError(res, "User not found", 404);

    return handleSuccess(res, "Updated successfully", user);
  } catch (error) {
    console.error("[updateUserByWallet]", error);
    if (error.code === 11000) {
      return handleError(res, "Email already exists", 409);
    }
    return handleError(res, "Server error", 500);
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    return handleSuccess(res, "Users found", users);
  } catch (error) {
    console.error("[getAllUsers]", error);
    return handleError(res, "Server error", 500);
  }
};

module.exports = {
  upsertUserByWallet,
  getUserByWallet,
  updateUserByWallet,
  getAllUsers,
};
