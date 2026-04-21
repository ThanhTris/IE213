const express = require("express");
const {
  createRepairLog,
  getRepairLogsBySerialNumber,
  getRepairLogsByModel,
  getAllRepairLogs,
  updateRepairLog,
} = require("../controllers/repairLog.controller");
const {
  authenticate,
  authorize,
  optionalAuthenticate,
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/history-by-model/:productCode",
  authenticate,
  authorize(["admin"]),
  getRepairLogsByModel,
);

router.post(
  "/",
  authenticate,
  authorize(["admin", "technician"]),
  createRepairLog,
);

router.get(
  "/",
  authenticate,
  authorize(["admin", "staff", "technician"]),
  getAllRepairLogs,
);

router.get(
  "/device/:serialNumber",
  optionalAuthenticate,
  getRepairLogsBySerialNumber,
);

router.patch(
  "/:id",
  authenticate,
  authorize(["admin", "technician"]),
  updateRepairLog,
);

module.exports = router;
