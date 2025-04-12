// models/ChickenBatch.js
const mongoose = require('mongoose');

const chickenBatchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  chickenType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChickenType',
    required: true
  },
  initialCount: {
    type: Number,
    required: true
  },
  currentCount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('ChickenBatch', chickenBatchSchema);