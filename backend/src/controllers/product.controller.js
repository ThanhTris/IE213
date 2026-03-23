const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const parseIdentifier = (idOrCode) => {
  if (!idOrCode) return null;
  if (mongoose.Types.ObjectId.isValid(idOrCode)) return { _id: idOrCode };
  return { productCode: idOrCode }; // fallback to productCode
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      productCode,
      productName,
      brand,
      model,
      color,
      configuration,
      specifications,
      imageUrl,
      price,
      warrantyMonths,
    } = req.body;

    if (!productCode || !productName || !brand) {
      return sendError(res, {
        statusCode: 400,
        error: "productCode, productName and brand are required",
      });
    }

    const existing = await Product.findOne({ productCode: productCode.trim() });
    if (existing) {
      return sendError(res, {
        statusCode: 409,
        error: "productCode already exists",
      });
    }

    const product = new Product({
      productCode: productCode.trim(),
      productName: productName.trim(),
      brand: brand.trim(),
      model: model ? model.trim() : undefined,
      color: color ? color.trim() : undefined,
      configuration: configuration ? configuration.trim() : undefined,
      specifications: specifications || undefined,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      price: typeof price === "number" ? price : undefined,
      warrantyMonths:
        typeof warrantyMonths === "number" ? warrantyMonths : undefined,
    });

    await product.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product created",
      data: product,
    });
  } catch (error) {
    console.error("[createProduct]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// GET /api/products
const listProducts = async (req, res) => {
  try {
    // const includeInactive = req.query.includeInactive === 'true';
    // const filter = includeInactive ? {} : { isActive: true };
    const products = await Product.find().select("-__v");

    return sendSuccess(res, {
      statusCode: 200,
      message: "Products retrieved",
      data: products,
    });
  } catch (error) {
    console.error("[listProducts]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// GET /api/products/:idOrCode
const getProduct = async (req, res) => {
  try {
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    const product = await Product.findOne(query).select("-__v");
    if (!product) {
      return sendError(res, { statusCode: 404, error: "Product not found" });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Product found",
      data: product,
    });
  } catch (error) {
    console.error("[getProduct]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// PUT /api/products/:idOrCode
const updateProduct = async (req, res) => {
  try {
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    const updates = {};
    const updatableFields = [
      "productName",
      "brand",
      "model",
      "color",
      "configuration",
      "specifications",
      "imageUrl",
      "price",
      "warrantyMonths",
      "isActive",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, {
        statusCode: 400,
        error: "No fields to update",
      });
    }

    if (updates.productCode) {
      delete updates.productCode; // never update code via this endpoint
    }

    const product = await Product.findOneAndUpdate(
      query,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).select("-__v");

    if (!product) {
      return sendError(res, { statusCode: 404, error: "Product not found" });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Product updated",
      data: product,
    });
  } catch (error) {
    console.error("[updateProduct]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

// DELETE /api/products/:idOrCode
const deleteProduct = async (req, res) => {
  try {
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    const hard = req.query.hard === "true";

    // Nếu muốn xóa hoàn toàn, thì sử dụng /api/products/:idOrCode?hard=true
    if (hard) {
      const result = await Product.findOneAndDelete(query);
      if (!result) {
        return sendError(res, { statusCode: 404, error: "Product not found" });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: "Product deleted",
      });
    }

    // Nếu muốn ẩn sản phẩm (soft delete), thì sử dụng /api/products/:idOrCode
    const product = await Product.findOneAndUpdate(
      query,
      { $set: { isActive: false } },
      { new: true },
    ).select("-__v");

    if (!product) {
      return sendError(res, { statusCode: 404, error: "Product not found" });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Product disabled",
      data: product,
    });
  } catch (error) {
    console.error("[deleteProduct]", error);
    return sendError(res, { statusCode: 500, error: error.message });
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
