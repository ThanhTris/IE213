const mongoose = require("mongoose");

const EVM_ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;

// ──────────────────────────────────────────────────────────
// Bộ enum trạng thái mới – mô phỏng quy trình sửa chữa
// tương tự các ứng dụng theo dõi giao hàng
// ──────────────────────────────────────────────────────────
const REPAIR_STATUSES = [
  "pending",        // Tiếp nhận
  "waiting_parts",  // Chờ linh kiện
  "fixing",         // Đang sửa
  "completed",      // Sửa xong
  "delivered",      // Đã giao
  "cancelled",      // Hủy
];

const REPAIR_TYPES = [
  "screen",    // Màn hình
  "battery",   // Pin
  "camera",    // Camera
  "hardware",  // Phần cứng
  "software",  // Phần mềm
  "other",     // Khác
];

// Luồng chuyển trạng thái hợp lệ
// delivered & cancelled là trạng thái kết thúc, không chuyển tiếp
const VALID_TRANSITIONS = {
  pending:       ["waiting_parts", "fixing", "cancelled"],
  waiting_parts: ["fixing", "cancelled"],
  fixing:        ["waiting_parts", "completed", "cancelled"],
  completed:     ["delivered", "cancelled"],
  delivered:     [],  // Trạng thái kết thúc – nếu sửa thêm, tạo phiếu mới
  cancelled:     [],  // Trạng thái kết thúc
};

// ──────────────────────────────────────────────────────────
// Sub-schema cho mỗi bước trong timeline
// ──────────────────────────────────────────────────────────
const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: REPAIR_STATUSES,
      required: true,
    },
    // Ghi chú chi tiết cho bước này (giống note trong app giao hàng)
    note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

// ──────────────────────────────────────────────────────────
// Schema chính – Phiếu sửa chữa (RepairLog)
// ──────────────────────────────────────────────────────────
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
    // Trạng thái hiện tại – luôn đồng bộ với entry cuối cùng trong timeline
    currentStatus: {
      type: String,
      enum: REPAIR_STATUSES,
      default: "pending",
      index: true,
    },
    // Loại hình sửa chữa
    type: {
      type: String,
      enum: REPAIR_TYPES,
      default: "other",
      index: true,
    },
    // true = được bảo hành miễn phí, false = phải trả phí sửa chữa
    isWarrantyCovered: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Chi phí sửa chữa (0 nếu được bảo hành)
    cost: { type: Number, default: 0, min: 0 },
    // Timeline – lưu vết chi tiết từng giai đoạn sửa chữa (giống tracking giao hàng)
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },
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

// ──────────────────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────────────────
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
repairLogSchema.index(
  { currentStatus: 1, updatedAt: -1 },
  { name: "idx_repair_current_status_updated" },
);

const RepairLog = mongoose.model("RepairLog", repairLogSchema);

// Export cả hằng số để Controller & Script có thể sử dụng
module.exports = RepairLog;
module.exports.REPAIR_STATUSES = REPAIR_STATUSES;
module.exports.VALID_TRANSITIONS = VALID_TRANSITIONS;
module.exports.REPAIR_TYPES = REPAIR_TYPES;
