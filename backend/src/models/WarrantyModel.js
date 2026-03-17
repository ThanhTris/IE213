const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true, trim: true },
  serialNumber: { type: String, required: true, unique: true, trim: true },
  serialHash: { type: String, required: true, trim: true },
  ownerAddress: { type: String, required: true, trim: true },
  productCode: { type: String, required: true, trim: true },
  productInfo: {
    productName: { type: String, trim: true },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    configuration: { type: String, trim: true },
  },
  expiryDate: { type: Date },
  status: { type: Boolean, default: true },
  mintTxHash: { type: String, trim: true },
  mintedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

warrantySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Warranty', warrantySchema);
