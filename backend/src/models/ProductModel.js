const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 64,
    },
    productName: { type: String, required: true, trim: true, maxlength: 255 },
    brand: { type: String, required: true, trim: true, maxlength: 100 },
    color: { type: String, trim: true, maxlength: 100 },
    // Đổi tên từ "configuration" thành "config" theo chuẩn camelCase schema mới
    config: { type: String, trim: true, maxlength: 255 },
    // imageUrl hỗ trợ cả http(s):// và ipfs:// (IPFS Pinata)
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^(https?:\/\/.+|ipfs:\/\/.+)/i.test(v),
        message: "imageUrl must be a valid http(s) or ipfs URL",
      },
    },
    warrantyMonths: { type: Number, default: 12, min: 0, max: 120 },
    price: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true, maxlength: 2000 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    collection: "product",
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

productSchema.index(
  { productCode: 1 },
  { unique: true, name: "uq_product_code" },
);
productSchema.index(
  { brand: 1, productName: 1 },
  { name: "idx_brand_product_name" },
);
productSchema.index(
  { isActive: 1, updatedAt: -1 },
  { name: "idx_product_active_updated" },
);

module.exports = mongoose.model("Product", productSchema);
