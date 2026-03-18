const express = require('express');
const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const router = express.Router();

// CRUD for products
router.post('/', createProduct);
router.get('/', listProducts);
router.get('/:idOrCode', getProduct);
router.put('/:idOrCode', updateProduct);
router.delete('/:idOrCode', deleteProduct);

module.exports = router;
