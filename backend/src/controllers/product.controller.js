const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const UPDATABLE_FIELDS = [
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

const parseNumberIfProvided = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

const parseIdentifier = (idOrCode) => {
  if (!idOrCode) return null;
  const normalizedIdentifier = idOrCode.trim();
  if (!normalizedIdentifier) return null;
  if (mongoose.Types.ObjectId.isValid(normalizedIdentifier)) {
    return { _id: normalizedIdentifier };
  }
  return { productCode: normalizeProductCode(normalizedIdentifier) };
};

const normalizeProductCode = (value = "") => value.trim().toUpperCase();

const toProductResponse = (product, options = {}) => {
  const { includeCreatedAt = false, includeUpdatedAt = false } = options;
  const safeProduct = {
    _id: product._id,
    productCode: product.productCode,
    productName: product.productName,
    brand: product.brand,
    model: product.model,
    color: product.color,
    configuration: product.configuration,
    specifications: product.specifications,
    imageUrl: product.imageUrl,
    price: product.price,
    warrantyMonths: product.warrantyMonths,
    isActive: product.isActive,
  };

  if (includeCreatedAt) safeProduct.createdAt = product.createdAt;
  if (includeUpdatedAt) safeProduct.updatedAt = product.updatedAt;

  return safeProduct;
};

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
    const body = req.body || {};
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
    } = body;

    const normalizedCode = normalizeProductCode(productCode || "");
    const normalizedName =
      typeof productName === "string" ? productName.trim() : "";
    const normalizedBrand = typeof brand === "string" ? brand.trim() : "";

    if (!normalizedCode || !normalizedName || !normalizedBrand) {
      const details = [];
      if (!normalizedCode) details.push("productCode");
      if (!normalizedName) details.push("productName");
      if (!normalizedBrand) details.push("brand");

      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "productCode, productName và brand là bắt buộc",
        details,
      });
    }

    const parsedPrice = parseNumberIfProvided(price);
    const parsedWarrantyMonths = parseNumberIfProvided(warrantyMonths);
    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedWarrantyMonths)) {
      const details = [];
      if (Number.isNaN(parsedPrice)) details.push("price");
      if (Number.isNaN(parsedWarrantyMonths)) details.push("warrantyMonths");

      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "price và warrantyMonths phải là số hợp lệ",
        details,
      });
    }

    const existing = await Product.findOne({ productCode: normalizedCode });
    if (existing) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Mã sản phẩm đã tồn tại",
        details: ["productCode"],
      });
    }

    const product = new Product(
      sanitizeProductPayload({
        productCode: normalizedCode,
        productName: normalizedName,
        brand: normalizedBrand,
        model,
        color,
        configuration,
        specifications: specifications || undefined,
        imageUrl,
        price: parsedPrice,
        warrantyMonths: parsedWarrantyMonths,
      }),
    );

    await product.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: "Tạo sản phẩm thành công",
      data: toProductResponse(product, {
        includeCreatedAt: true,
      }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Mã sản phẩm đã tồn tại",
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

    // Chỉ admin mới được xem cả sản phẩm đã ẩn.
    if (includeInactive && (!req.user || req.user.role !== "admin")) {
      return sendError(res, {
        statusCode: 403,
        errorCode: "E403_FORBIDDEN",
        message: "Bạn không có quyền xem sản phẩm đã ẩn",
      });
    }

    const filter = includeInactive ? {} : { isActive: true };
    const products = await Product.find(filter);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: products.map((product) => toProductResponse(product)),
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
        message: "idOrCode là trường bắt buộc",
        details: ["idOrCode"],
      });
    }

    const product = await Product.findOne(query);
    if (!product) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy sản phẩm",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy thông tin sản phẩm thành công",
      data: toProductResponse(product),
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/products/:idOrCode
const updateProduct = async (req, res, next) => {
  try {
    const body = req.body || {};
    const identifier = req.params.idOrCode;
    const query = parseIdentifier(identifier);

    if (!query) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_MISSING_FIELD",
        message: "idOrCode là trường bắt buộc",
        details: ["idOrCode"],
      });
    }

    if (body.productCode !== undefined) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "productCode không được phép cập nhật",
        details: ["productCode"],
      });
    }

    const updates = {};
    UPDATABLE_FIELDS.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Không có dữ liệu để cập nhật",
      });
    }

    if (updates.price !== undefined) {
      const parsedPrice = parseNumberIfProvided(updates.price);
      if (Number.isNaN(parsedPrice)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "price phải là số hợp lệ",
          details: ["price"],
        });
      }
      updates.price = parsedPrice;
    }

    if (updates.warrantyMonths !== undefined) {
      const parsedWarrantyMonths = parseNumberIfProvided(
        updates.warrantyMonths,
      );
      if (Number.isNaN(parsedWarrantyMonths)) {
        return sendError(res, {
          statusCode: 400,
          errorCode: "E400_VALIDATION",
          message: "warrantyMonths phải là số hợp lệ",
          details: ["warrantyMonths"],
        });
      }
      updates.warrantyMonths = parsedWarrantyMonths;
    }

    const product = await Product.findOneAndUpdate(
      query,
      { $set: sanitizeProductPayload(updates) },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy sản phẩm",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Cập nhật sản phẩm thành công",
      data: toProductResponse(product, { includeUpdatedAt: true }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, {
        statusCode: 400,
        errorCode: "E400_VALIDATION",
        message: "Mã sản phẩm đã tồn tại",
        details: ["productCode"],
      });
    }
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
        message: "idOrCode là trường bắt buộc",
        details: ["idOrCode"],
      });
    }

    const product = await Product.findOneAndUpdate(
      query,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!product) {
      return sendError(res, {
        statusCode: 404,
        errorCode: "E404_NOT_FOUND",
        message: "Không tìm thấy sản phẩm",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Ẩn sản phẩm thành công",
      data: toProductResponse(product, { includeUpdatedAt: true }),
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
