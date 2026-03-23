const mongoose = require("mongoose");

const repairLogSchema = new mongoose.Schema(
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
    warrantyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warranty",
      index: true,
    },
    technicianName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    repairDate: { type: Date, required: true, default: Date.now, index: true },
    repairContent: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    partsReplaced: [
      {
        type: String,
        trim: true,
        maxlength: 255,
      },
    ],
    cost: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, maxlength: 2000 },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
    },
    updatedBy: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    collection: "repair_logs",
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

repairLogSchema.index(
  { tokenId: 1, repairDate: -1 },
  { name: "idx_repair_token_date" },
);
repairLogSchema.index(
  { serialNumber: 1, repairDate: -1 },
  { name: "idx_repair_serial_date" },
);
repairLogSchema.index(
  { warrantyId: 1, repairDate: -1 },
  { name: "idx_repair_warranty_date" },
);

module.exports = mongoose.model("RepairLog", repairLogSchema);
