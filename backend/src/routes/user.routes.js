const express = require("express");
const {
  upsertUserByWallet,
  getUserByWallet,
  updateUserByWallet,
  getAllUsers,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Web3 login/register
router.post("/auth", upsertUserByWallet);

// Get user by wallet (profile)
router.get("/me", authenticate, getUserByWallet);

// Update user
router.put("/:walletAddress", authenticate, updateUserByWallet);

// Admin get all users
router.get("/", authenticate, authorize(["admin"]), getAllUsers);

module.exports = router;
