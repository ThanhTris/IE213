const express = require("express");
const {
  createWarranty,
  updateMintInfo,
  getAllWarranties,
  getWarrantyByIdAdmin,
  updateWarrantyStatus,
  getMyWarranties,
  verifyWarrantyBySerialNumber,
  countWarrantiesByWallet,
  getWarrantiesByWallet,
  getWarrantyStats,
} = require("../controllers/warranty.controller");
const { authenticate: verifyToken, authorize } = require("../middleware/auth");
const { uploadSingleImage } = require("../middleware/multer");

const router = express.Router();

const authorizeRoles = (...roles) => authorize(roles);

// Get warranty stats for current user
router.get("/stats/me", verifyToken, getWarrantyStats);

// Static routes trước dynamic routes
router.get("/my-warranties", verifyToken, getMyWarranties);
router.get("/verify/:serialNumber", verifyWarrantyBySerialNumber);
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getAllWarranties,
);

// POST /api/warranties — nhận multipart/form-data (optional image)
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  uploadSingleImage,
  createWarranty,
);

// PATCH /api/warranties/:id — update on-chain mint proof (admin/staff)
router.patch(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  updateMintInfo,
);

// PATCH /api/warranties/:id/status
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin", "staff"),
  updateWarrantyStatus,
);

// GET /api/warranties/count/:walletAddress (admin/staff)
router.get(
  "/count/:walletAddress",
  verifyToken,
  authorizeRoles("admin", "staff"),
  countWarrantiesByWallet,
);

// GET /api/warranties/user/:walletAddress (admin/staff)
router.get(
  "/user/:walletAddress",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getWarrantiesByWallet,
);

// GET /api/warranties/:id — chi tiết (admin/staff)
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getWarrantyByIdAdmin,
);


module.exports = router;
