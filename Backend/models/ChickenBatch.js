// models/ChickenBatch.js
const mongoose = require('mongoose');

const chickenBatchSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // This will be set in the pre-save hook
      return '';
    }
  },
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
  }
});

// Pre-save hook to auto-generate the BATCH-XXX ID
chickenBatchSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    const lastBatch = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
    let nextNumber = 1;
    
    if (lastBatch && lastBatch.id) {
      const lastNumber = parseInt(lastBatch.id.split('-')[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    this.id = `BATCH-${String(nextNumber).padStart(3, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('ChickenBatch', chickenBatchSchema);