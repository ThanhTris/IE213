const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { uploadFileToPinata } = require("../utils/pinata");

// Fields cho phép cập nhật qua PUT
const UPDATABLE_FIELDS = [
  "productName",
  "brand",
  "color",
  "config",
  "imageUrl",
  "price",
  "warrantyMonths",
  "description",
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
    color: product.color,
    config: product.config,
    imageUrl: product.imageUrl,
    price: product.price,
    warrantyMonths: product.warrantyMonths,
    description: product.description,
    isActive: product.isActive,
  };

  // Đảm bảo lấy đúng trường thời gian dù là Mongoose Document hay POJO
  if (includeCreatedAt) safeProduct.createdAt = product.createdAt || product.created_at;
  if (includeUpdatedAt) safeProduct.updatedAt = product.updatedAt || product.updated_at;

  // Bao gồm thông tin sửa chữa mới nhất nếu có (từ Aggregation)
  if (product.latestRepair) {
    safeProduct.latestRepair = product.latestRepair;
  }

  return safeProduct;
};

const sanitizeProductPayload = (payload = {}) => {
  const nextPayload = { ...payload };

  ["productName", "brand", "color", "config", "imageUrl", "description"].forEach((field) => {
    if (typeof nextPayload[field] === "string") {
      nextPayload[field] = nextPayload[field].trim();
    }
  });

  return nextPayload;
};

// POST /api/products — nhận multipart/form-data, upload ảnh lên Pinata
const createProduct = async (req, res, next) => {
  try {
    const body = req.body || {};
    const {
      productCode,
      productName,
      brand,
      color,
      config,
      price,
      warrantyMonths,
      description,
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

    // -------------------------------------------------------
    // XỬ LÝ ẢNH: Upload lên Pinata nếu có file
    // -------------------------------------------------------
    let imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : undefined;

    if (req.file && process.env.PINATA_JWT) {
      try {
        const imageCID = await uploadFileToPinata(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        imageUrl = `ipfs://${imageCID}`;
        console.log(`[Pinata] Ảnh sản phẩm ${normalizedCode} uploaded: ${imageUrl}`);
      } catch (ipfsError) {
        console.error("[Pinata] Upload ảnh thất bại:", ipfsError.message);
        return sendError(res, {
          statusCode: 502,
          errorCode: "E502_IPFS",
          message: `Upload ảnh lên IPFS thất bại: ${ipfsError.message}`,
        });
      }
    }

    const product = new Product(
      sanitizeProductPayload({
        productCode: normalizedCode,
        productName: normalizedName,
        brand: normalizedBrand,
        color,
        config,
        imageUrl,
        price: parsedPrice,
        warrantyMonths: parsedWarrantyMonths,
        description,
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
    // Mặc định: Trừ 'user' (khách hàng) ra thì tất cả các role khác (admin, staff, tech...) đều được xem hết để quản lý
    const filter = (req.user && req.user.role && req.user.role !== "user") ? {} : { isActive: true };

    // Debug context
    console.log(`[Database Debug] Current DB: ${mongoose.connection.name}`);
    const colls = await mongoose.connection.db.listCollections().toArray();
    console.log(`[Database Debug] Collections: ${colls.map(c => c.name).join(", ")}`);

    // Sử dụng Aggregation nguyên bản: Tận dụng cơ chế Array Lookup của MongoDB
    const products = await Product.aggregate([
      { $match: filter },
      // Bước 1: Lấy danh sách bảo hành gắn với productCode
      {
        $lookup: {
          from: "warranties",
          localField: "productCode",
          foreignField: "productCode",
          as: "warrantyDocs",
        },
      },
      // Bước 2: Lấy tất cả lịch sử sửa chữa khớp với các serial trong warrantyDocs
      {
        $lookup: {
          from: "repair_log",
          localField: "warrantyDocs.serialNumber",
          foreignField: "serialNumber",
          as: "allRepairs",
        },
      },
      // Bước 3: Lấy bản ghi mới nhất
      {
        $addFields: {
          latestRepair: {
            $reduce: {
              input: "$allRepairs",
              initialValue: null,
              in: {
                $cond: [
                  { 
                    $or: [
                      { $eq: ["$$value", null] },
                      { $gt: ["$$this.repairDate", "$$value.repairDate"] }
                    ]
                  },
                  "$$this",
                  "$$value"
                ]
              }
            }
          }
        }
      },
      { $project: { warrantyDocs: 0, allRepairs: 0 } }
    ]);

    // Debug log chi tiết để kiểm tra trường thời gian
    if (products.length > 0) {
      const foundCount = products.filter(p => p.latestRepair).length;
      const hasTimeCount = products.filter(p => p.createdAt || p.updatedAt).length;
      console.log(`[Debug] Products: ${products.length}, latestRepair: ${foundCount}, hasTimestamps: ${hasTimeCount}`);
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: products.map((product) =>
        toProductResponse(product, {
          includeCreatedAt: true,
          includeUpdatedAt: true,
        }),
      ),
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
      data: toProductResponse(product, {
        includeCreatedAt: true,
        includeUpdatedAt: true,
      }),
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

    // Xử lý upload ảnh mới nếu có (PUT cũng hỗ trợ multipart)
    if (req.file && process.env.PINATA_JWT) {
      try {
        const imageCID = await uploadFileToPinata(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );
        updates.imageUrl = `ipfs://${imageCID}`;
        console.log(`[Pinata] Ảnh sản phẩm cập nhật uploaded: ${updates.imageUrl}`);
      } catch (ipfsError) {
        console.error("[Pinata] Upload ảnh thất bại:", ipfsError.message);
        return sendError(res, {
          statusCode: 502,
          errorCode: "E502_IPFS",
          message: `Upload ảnh lên IPFS thất bại: ${ipfsError.message}`,
        });
      }
    }

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

    if (updates.isActive !== undefined) {
      updates.isActive = String(updates.isActive) === "true";
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

// DELETE /api/products/:idOrCode (soft delete)
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
