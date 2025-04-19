const mongoose = require('mongoose');

const chickenBatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  breedType: {
    type: String,
    required: true
  },
  placementDate: {
    type: Date,
    required: true
  },
  initialCount: {
    type: Number,
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Batch', chickenBatchSchema);