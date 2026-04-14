const mongoose = require("mongoose");

const EVM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;

const repairLogSchema = new mongoose.Schema(
  {
    warrantyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warranty",
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 128,
    },
    tokenId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128,
      index: true,
    },
    technicianWallet: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: EVM_ADDRESS_REGEX,
      index: true,
    },
    technicianName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    repairDate: { type: Date, default: Date.now, index: true },
    completionDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "completed",
      index: true,
    },
    repairType: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    serviceCenter: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    repairContent: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    partsReplaced: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 255,
        },
      ],
      default: [],
    },
    cost: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  {
    collection: "repair_log",
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

repairLogSchema.index(
  { serialNumber: 1, repairDate: -1 },
  { name: "idx_repair_serial_date" },
);
repairLogSchema.index(
  { createdAt: -1 },
  { name: "idx_repair_created_at_desc" },
);
repairLogSchema.index(
  { technicianWallet: 1, repairDate: -1 },
  { name: "idx_repair_technician_wallet_date" },
);

module.exports = mongoose.model("RepairLog", repairLogSchema);
