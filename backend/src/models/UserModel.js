const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^0x[a-f0-9]{40}$/,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    fullName: { type: String, trim: true, maxlength: 150 },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[0-9+\-()\s]{8,20}$/.test(v);
        },
        message: "Invalid phone format",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user", "technician"],
      default: "user",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  {
    collection: "user",
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

userSchema.index(
  { email: 1 },
  { unique: true, sparse: true, name: "uq_user_email" },
);
userSchema.index(
  { walletAddress: 1 },
  { unique: true, name: "uq_user_wallet" },
);
userSchema.index({ role: 1, isActive: 1 }, { name: "idx_user_role_active" });

module.exports = mongoose.model("User", userSchema);
