const mongoose = require('mongoose');

const repairLogSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    index: true
  },
  serialNumber: {
    type: String,
    required: true,
    index: true
  },
  warrantyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warranty'
  },
  technicianName: {
    type: String,
    required: true
  },
  repairDate: {
    type: Date,
    default: Date.now
  },
  repairContent: {
    type: String,
    required: true
  },
  partsReplaced: [{
    type: String
  }],
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String
  },
  images: [{
    type: String
  }],
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

repairLogSchema.index({ tokenId: 1, repairDate: -1 });
repairLogSchema.index({ serialNumber: 1, repairDate: -1 });

module.exports = mongoose.model('RepairLog', repairLogSchema);