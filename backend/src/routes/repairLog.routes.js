const express = require("express");
const {
  createRepairLog,
  getRepairLogsBySerialNumber,
  getAllRepairLogs,
  updateRepairLog,
} = require("../controllers/repairLog.controller");
const {
  authenticate,
  authorize,
  optionalAuthenticate,
} = require("../middleware/auth");

const router = express.Router();

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

router.patch(
  "/:id",
  authenticate,
  authorize(["admin", "technician"]),
  updateRepairLog,
);

router.get(
  "/device/:serialNumber",
  optionalAuthenticate,
  getRepairLogsBySerialNumber,
);

module.exports = router;
