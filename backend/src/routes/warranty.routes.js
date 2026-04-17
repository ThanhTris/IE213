const express = require("express");
const {
  createWarranty,
  updateMintInfo,
  getAllWarranties,
  getWarrantyByIdAdmin,
  updateWarrantyStatus,
  getMyWarranties,
  verifyWarrantyBySerialNumber,
} = require("../controllers/warranty.controller");
const { authenticate: verifyToken, authorize } = require("../middleware/auth");
const { uploadSingleImage } = require("../middleware/multer");

const router = express.Router();

const authorizeRoles = (...roles) => authorize(roles);

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

// GET /api/warranties/:id — chi tiết (admin/staff)
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getWarrantyByIdAdmin,
);

module.exports = router;
