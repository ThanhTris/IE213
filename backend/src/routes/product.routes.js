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

const router = express.Router();

// CRUD for products
router.post("/", authenticate, authorize(["admin"]), createProduct);
router.get("/", optionalAuthenticate, listProducts);
router.get("/:idOrCode", getProduct);
router.put("/:idOrCode", authenticate, authorize(["admin"]), updateProduct);
router.delete("/:idOrCode", authenticate, authorize(["admin"]), deleteProduct);

module.exports = router;
