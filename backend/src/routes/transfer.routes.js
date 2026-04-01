const express = require("express");
const {
  createTransfer,
  getByTxHash,
  getByTokenId,
} = require("../controllers/transferHistory.controller");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/transfers - user initiated NFT transfer
router.post("/", authenticate, createTransfer);

// Public GETs
// GET /api/transfers/tx/:txHash - lookup transfer detail by txHash (public)
router.get("/tx/:txHash", getByTxHash);

// GET /api/transfers/token/:tokenId - public transfer history for a token
router.get("/token/:tokenId", getByTokenId);

module.exports = router;
