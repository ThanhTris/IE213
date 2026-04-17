const mongoose = require("mongoose");

const transferHistorySchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 128,
    },
    serialNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 128,
    },
    fromAddress: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      default: null,
    },
    toAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: /^0x[a-f0-9]{64}$/,
    },
    transferType: {
      type: String,
      enum: ["mint", "transfer", "burn"],
      default: "transfer",
      index: true,
    },
    transferDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "transfer_history",
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

transferHistorySchema.index(
  { tokenId: 1, transferDate: -1 },
  { name: "idx_transfer_token_date" },
);
transferHistorySchema.index(
  { serialNumber: 1, transferDate: -1 },
  { name: "idx_transfer_serial_date" },
);
transferHistorySchema.index(
  { toAddress: 1, transferDate: -1 },
  { name: "idx_transfer_owner_date" },
);

module.exports = mongoose.model("TransferHistory", transferHistorySchema);
