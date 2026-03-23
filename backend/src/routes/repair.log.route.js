const express = require('express');
const router = express.Router();
const repairLogController = require('../controllers/repairLogController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post(
  '/',
  authenticate,
  authorize(['technician', 'admin']),
  repairLogController.createRepairLog
);

router.get(
  '/token/:tokenId',
  authenticate,
  repairLogController.getRepairLogsByTokenId
);

router.get(
  '/:id',
  authenticate,
  repairLogController.getRepairLogById
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  repairLogController.updateRepairLog
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  repairLogController.deleteRepairLog
);

module.exports = router;
