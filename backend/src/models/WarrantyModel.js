const mongoose = require("mongoose");

const warrantySchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      default: null,
      index: {
        unique: true,
        partialFilterExpression: { tokenId: { $type: "string" } },
      },
    },
    tokenURI: {
      type: String,
      required: false,
      default: null,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      maxlength: 128,
    },
    serialHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: /^0x[a-f0-9]{64}$/,
    },
    ownerAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      match: /^0x[a-f0-9]{40}$/,
    },
    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
      maxlength: 64,
    },
    productInfo: {
      type: {
        productName: { type: String, trim: true, maxlength: 255 },
        brand: { type: String, trim: true, maxlength: 100 },
        color: { type: String, trim: true, maxlength: 100 },
        configuration: { type: String, trim: true, maxlength: 255 },
        _id: false,
      },
      required: true,
    },
    // Keep epoch-seconds to align with blockchain payload samples.
    expiryDate: { type: Number, required: true, min: 0, index: true },
    status: { type: Boolean, default: true, index: true },
    mintTxHash: {
      type: String,
      default: null,
    },
    mintedAt: { type: Date, default: null },
    revokedAt: { type: Date },
    revokedReason: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    collection: "warranties",
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        const now = Math.floor(Date.now() / 1000);
        ret.isExpired = ret.expiryDate < now;
        if (ret.isExpired) ret.status = false;
        delete ret._id;
        return ret;
      },
    },
  },
);

warrantySchema.index(
  { serialNumber: 1 },
  { unique: true, name: "uq_warranty_serial_number" },
);
warrantySchema.index(
  { serialHash: 1 },
  { unique: true, name: "uq_warranty_serial_hash" },
);
warrantySchema.index(
  { ownerAddress: 1, status: 1, mintedAt: -1 },
  { name: "idx_warranty_owner_status_minted" },
);
warrantySchema.index(
  { productCode: 1, status: 1 },
  { name: "idx_warranty_product_status" },
);

module.exports = mongoose.model("Warranty", warrantySchema);
