const mongoose = require('mongoose');

const transferHistorySchema = new mongoose.Schema({
  tokenId: { type: String, required: true, trim: true },
  serialNumber: { type: String, required: true, trim: true },
  fromAddress: { type: String, trim: true },
  toAddress: { type: String, required: true, trim: true },
  transferDate: { type: Date, default: Date.now },
  txHash: { type: String, trim: true },
  transferType: { type: String, enum: ['mint', 'transfer'], default: 'transfer' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

transferHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TransferHistory', transferHistorySchema);
