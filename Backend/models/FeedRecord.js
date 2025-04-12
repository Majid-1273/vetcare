// models/FeedRecord.js
const mongoose = require('mongoose');

const feedRecordSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChickenBatch',
    required: true
  },
  feedType: {
    type: String,
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  avgConsumptionPerBird: {
    type: Number,
    required: true
  },
  totalFeedUsed: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FeedRecord', feedRecordSchema);