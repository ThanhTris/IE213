const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, unique: true, trim: true },
  productName: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  model: { type: String, trim: true },
  color: { type: String, trim: true },
  configuration: { type: String, trim: true },
  specifications: {
    ram: { type: String, trim: true },
    storage: { type: String, trim: true },
    processor: { type: String, trim: true },
    screenSize: { type: String, trim: true },
  },
  imageUrl: { type: String, trim: true },
  price: { type: Number, default: 0 },
  warrantyMonths: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
