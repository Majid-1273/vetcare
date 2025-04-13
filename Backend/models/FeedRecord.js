const mongoose = require('mongoose');

const feedRecordSchema = new mongoose.Schema({
  ageGroup: {
    type: String,
    required: true
  },
  feedType: {
    type: String,
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
