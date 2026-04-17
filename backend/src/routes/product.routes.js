const express = require("express");
const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const {
  authenticate,
  optionalAuthenticate,
  authorize,
} = require("../middleware/auth");
const { uploadSingleImage } = require("../middleware/multer");

const router = express.Router();

// CRUD for products
// POST: nhận multipart/form-data, multer parse file ảnh trước khi vào controller
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  uploadSingleImage,
  createProduct,
);
router.get("/", optionalAuthenticate, listProducts);
router.get("/:idOrCode", getProduct);
// PUT cũng hỗ trợ upload ảnh mới
router.put(
  "/:idOrCode",
  authenticate,
  authorize(["admin"]),
  uploadSingleImage,
  updateProduct,
);
router.delete(
  "/:idOrCode",
  authenticate,
  authorize(["admin"]),
  deleteProduct,
);

module.exports = router;
