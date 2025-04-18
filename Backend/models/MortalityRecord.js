const mongoose = require('mongoose');

const mortalityRecordSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalBirdsCount: {
    type: Number,
    required: true
  },
  deadBirdsCount: {
    type: Number,
    required: true
  },
  mortalityRate: {
    type: Number,
    required: true
  },
  cumulativeLoss: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MortalityRecord', mortalityRecordSchema);
