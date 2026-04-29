const mongoose = require("mongoose");

const warrantySchema = new mongoose.Schema(
  {
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
    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
      maxlength: 64,
    },
    // Đổi tên từ ownerAddress → ownerWallet (chuẩn Web3 camelCase mới)
    ownerWallet: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      match: /^0x[a-f0-9]{40}$/,
    },
    tokenId: {
      type: String,
      default: null,
      index: {
        unique: true,
        partialFilterExpression: { tokenId: { $type: "string" } },
      },
    },
    // Đổi tên từ mintTxHash → txHash
    txHash: {
      type: String,
      default: null,
    },
    tokenURI: {
      type: String,
      required: false,
      default: null,
    },
    // Keep epoch-seconds to align with blockchain payload samples.
    expiryDate: { type: Number, required: true, min: 0, index: true },
    status: { type: Boolean, default: true, index: true },
    mintedAt: { type: Date, default: null },
    // Dùng để hủy bảo hành khi thiết bị bị vi phạm (ví dụ tháo máy tự ý)
    revokedAt: { type: Date },
    revokedReason: { type: String, trim: true, maxlength: 500 },
    // isActive: false khi bảo hành hết hạn
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    collection: "warranties",
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

warrantySchema.index(
  { serialNumber: 1 },
  { unique: true, name: "uq_warranty_serial_number" },
);
warrantySchema.index(
  { serialHash: 1 },
  { unique: true, name: "uq_warranty_serial_hash" },
);
warrantySchema.index(
  { ownerWallet: 1, status: 1, mintedAt: -1 },
  { name: "idx_warranty_owner_status_minted" },
);
warrantySchema.index(
  { productCode: 1, status: 1 },
  { name: "idx_warranty_product_status" },
);

module.exports = mongoose.model("Warranty", warrantySchema);
