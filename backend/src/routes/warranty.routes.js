const express = require("express");
const {
  createWarranty,
  getWarrantyByTokenId,
  getWarrantiesByOwner,
  getAllWarranties,
  updateWarranty,
} = require("../controllers/warranty.controller");

const router = express.Router();

// POST /api/warranties - Tạo phiếu bảo hành mới
router.post("/", createWarranty);

// GET /api/warranties/:tokenId - Lấy chi tiết phiếu bảo hành theo tokenId
router.get("/:tokenId", getWarrantyByTokenId);

// GET /api/warranties/owner/:ownerAddress - Lấy danh sách phiếu bảo hành theo ownerAddress
router.get("/owner/:ownerAddress", getWarrantiesByOwner);

// GET /api/warranties - Lấy tất cả phiếu bảo hành (cho Admin)
router.get("/", getAllWarranties);

// PUT /api/warranties/:tokenId - Cập nhật trạng thái phiếu bảo hành
router.put("/:tokenId", updateWarranty);

module.exports = router;
