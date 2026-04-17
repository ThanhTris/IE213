const mongoose = require("mongoose");

const EVM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;

const repairLogSchema = new mongoose.Schema(
  {
    // Tham chiếu đến Warranty để truy xuất lịch sử sửa chữa của thiết bị
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
    technicianWallet: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: EVM_ADDRESS_REGEX,
      index: true,
    },
    repairContent: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // true = được bảo hành miễn phí, false = phải trả phí sửa chữa
    isWarrantyCovered: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Trạng thái đơn sửa chữa
    status: {
      type: String,
      enum: ["pending", "in_progress", "done", "rejected"],
      default: "pending",
      index: true,
    },
    // Chi phí sửa chữa (0 nếu được bảo hành)
    cost: { type: Number, default: 0, min: 0 },
    repairDate: { type: Date, default: Date.now, index: true },
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
