const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'user', 'technician'], default: 'user' },
  isActive: { type: Boolean, default: true },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
