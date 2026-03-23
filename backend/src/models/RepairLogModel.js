const mongoose = require('mongoose');

const repairLogSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, trim: true },
  serialNumber: { type: String, required: true, trim: true },
  technicianName: { type: String, trim: true },
  repairDate: { type: Date, default: Date.now },
  repairContent: { type: String, trim: true },
  partsReplaced: [
    {
      partName: { type: String, trim: true },
      cost: { type: Number, default: 0 },
      notes: { type: String, trim: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

repairLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RepairLog', repairLogSchema);
