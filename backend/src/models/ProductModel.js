const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 64,
    },
    productName: { type: String, required: true, trim: true, maxlength: 255 },
    brand: { type: String, required: true, trim: true, maxlength: 100 },
    model: { type: String, trim: true, maxlength: 100 },
    color: { type: String, trim: true, maxlength: 100 },
    configuration: { type: String, trim: true, maxlength: 255 },
    specifications: {
      ram: { type: String, trim: true, maxlength: 50 },
      storage: { type: String, trim: true, maxlength: 50 },
      processor: { type: String, trim: true, maxlength: 100 },
      screenSize: { type: String, trim: true, maxlength: 50 },
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/i.test(v),
        message: "imageUrl must be a valid http(s) URL",
      },
    },
    price: { type: Number, default: 0, min: 0 },
    warrantyMonths: { type: Number, default: 12, min: 0, max: 120 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    collection: "product",
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
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
