const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const parseIdentifier = (idOrCode) => {
  if (!idOrCode) return null;
  if (mongoose.Types.ObjectId.isValid(idOrCode)) return { _id: idOrCode };
  return { productCode: idOrCode.trim() };
};

const normalizeProductCode = (value = "") => value.trim();

const sanitizeProductPayload = (payload = {}) => {
  const nextPayload = { ...payload };

  [
    "productName",
    "brand",
    "model",
    "color",
    "configuration",
    "imageUrl",
  ].forEach((field) => {
    if (typeof nextPayload[field] === "string") {
      nextPayload[field] = nextPayload[field].trim();
    }
  });

  return nextPayload;
};

// POST /api/products
const createProduct = async (req, res, next) => {
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
      const details = [];
      if (!productCode) details.push("productCode");
      if (!productName) details.push("productName");
      if (!brand) details.push("brand");

      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "productCode, productName and brand are required",
        details,
      });
    }

    const normalizedCode = normalizeProductCode(productCode);
    const existing = await Product.findOne({ productCode: normalizedCode });
    if (existing) {
      return sendError(res, {
        statusCode: 409,
        errorCode: "E409_DUPLICATE",
        message: "productCode already exists",
        details: ["productCode"],
      });
    }

    const product = new Product(
      sanitizeProductPayload({
        productCode: normalizedCode,
        productName,
        brand,
        model,
        color,
        configuration,
        specifications: specifications || undefined,
        imageUrl,
        price: typeof price === "number" ? price : undefined,
        warrantyMonths:
          typeof warrantyMonths === "number" ? warrantyMonths : undefined,
      }),
    );

    await product.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product created",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        errorCode: "E409_DUPLICATE",
        message: "productCode already exists",
        details: ["productCode"],
      });
    }
    return next(error);
  }
};

// GET /api/products
const listProducts = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const products = await Product.find(filter).select("-__v");

    return sendSuccess(res, {
      statusCode: 200,
      message: "Products retrieved",
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/products/:idOrCode
const getProduct = async (req, res, next) => {
  try {
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    if (!query) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "idOrCode is required",
        details: ["idOrCode"],
      });
    }

    const product = await Product.findOne(query).select("-__v");
    if (!product) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Product not found",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Product found",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/products/:idOrCode
const updateProduct = async (req, res, next) => {
  try {
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    if (!query) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "idOrCode is required",
        details: ["idOrCode"],
      });
    }

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
        errorCode: "E400_VALIDATION",
        message: "No fields to update",
      });
    }

    if (updates.productCode) {
      delete updates.productCode; // Contract: productCode is immutable in update endpoint.
    }

    const product = await Product.findOneAndUpdate(
      query,
      { $set: sanitizeProductPayload(updates) },
      {
        new: true,
        runValidators: true,
      },
    ).select("-__v");

    if (!product) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Product not found",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Product updated",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/products/:idOrCode
const deleteProduct = async (req, res, next) => {
  try {
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    if (!query) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "idOrCode is required",
        details: ["idOrCode"],
      });
    }

    const hard = req.query.hard === "true";

    if (hard) {
      const result = await Product.findOneAndDelete(query);
      if (!result) {
        return sendError(res, {
          statusCode: 404,
          errorCode: "E404_NOT_FOUND",
          message: "Product not found",
        });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: "Product deleted",
      });
    }

    const product = await Product.findOneAndUpdate(
      query,
      { $set: { isActive: false } },
      { new: true },
    ).select("-__v");

    if (!product) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Product not found",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Product disabled",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
