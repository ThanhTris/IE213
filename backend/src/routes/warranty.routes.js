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

const router = express.Router();

const authorizeRoles = (...roles) => authorize(roles);

// Static routes must be defined before dynamic routes.
router.get("/my-warranties", verifyToken, getMyWarranties);
router.get("/verify/:serialNumber", verifyWarrantyBySerialNumber);
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getAllWarranties,
);

// POST /api/warranties - pre-mint record
router.post("/", verifyToken, authorizeRoles("admin", "staff"), createWarranty);

// PUT /api/warranties/:id/mint - update on-chain mint proof
router.put(
  "/:id/mint",
  verifyToken,
  authorizeRoles("admin", "staff"),
  updateMintInfo,
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin", "staff"),
  updateWarrantyStatus,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getWarrantyByIdAdmin,
);

module.exports = router;
