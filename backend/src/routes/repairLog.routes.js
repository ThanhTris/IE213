const express = require("express");
const {
  createRepairLog,
  getRepairLogsBySerialNumber,
  getAllRepairLogs,
  updateRepairLog,
  getRepairLogsByModel,
} = require("../controllers/repairLog.controller");
const {
  authenticate,
  authorize,
  optionalAuthenticate,
} = require("../middleware/auth");

const router = express.Router();

// POST   /api/repair-logs          — Tạo phiếu sửa chữa mới (admin, technician)
router.post(
  "/",
  authenticate,
  authorize(["admin", "technician"]),
  createRepairLog,
);

// GET    /api/repair-logs          — Lấy tất cả phiếu sửa chữa (admin, staff, technician)
router.get(
  "/",
  authenticate,
  authorize(["admin", "staff", "technician"]),
  getAllRepairLogs,
);

// PATCH  /api/repair-logs/:id      — Cập nhật tiến độ sửa chữa (admin, technician)
router.patch(
  "/:id",
  authenticate,
  authorize(["admin", "technician"]),
  updateRepairLog,
);

// Tương thích với FE gọi patch /:id/status
router.patch(
  "/:id/status",
  authenticate,
  authorize(["admin", "technician"]),
  updateRepairLog,
);

// GET    /api/repair-logs/device/:serialNumber — Lịch sử sửa chữa theo thiết bị
router.get(
  "/device/:serialNumber",
  optionalAuthenticate,
  getRepairLogsBySerialNumber,
);

// GET    /api/repair-logs/history-by-model/:productCode — Lịch sử sửa chữa theo dòng máy
router.get(
  "/history-by-model/:productCode",
  optionalAuthenticate,
  getRepairLogsByModel,
);

module.exports = router;
