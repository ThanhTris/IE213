const express = require("express");
const {
  upsertUserByWallet,
  getUserByWallet,
  updateMyProfile,
  updateUserByWallet,
  updateUserRole,
  updateUserIsActive,
  getUserByWalletAddressForAdmin,
  getAllUsers,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Web3 login/register
router.post("/auth", upsertUserByWallet);

// Get user by wallet (profile)
router.get("/me", authenticate, getUserByWallet);

// Update my profile
router.put("/me", authenticate, updateMyProfile);

// Admin update user by wallet (role/isActive/...)
router.get(
  "/:walletAddress",
  authenticate,
  authorize(["admin", "staff", "technician"]),
  getUserByWalletAddressForAdmin,
);
router.put(
  "/:walletAddress",
  authenticate,
  authorize(["admin", "staff", "technician"]),
  updateUserByWallet,
);
router.patch(
  "/:walletAddress",
  authenticate,
  authorize(["admin", "staff", "technician"]),
  updateUserByWallet,
);

// Admin update role / isActive via dedicated endpoints
router.patch(
  "/:walletAddress/role",
  authenticate,
  authorize(["admin"]),
  updateUserRole,
);
router.patch("/:walletAddress/is-active", authenticate, updateUserIsActive);

// Privileged roles get all users
router.get(
  "/",
  authenticate,
  authorize(["admin", "staff", "technician"]),
  getAllUsers,
);

module.exports = router;
