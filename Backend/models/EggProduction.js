const mongoose = require('mongoose');

const eggProductionSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  week: {
    type: Number,
    required: true // since it's user-provided, better to make it required
  },
  morningEggs: {
    type: Number,
    default: 0
  },
  noonEggs: {
    type: Number,
    default: 0
  },
  eveningEggs: {
    type: Number,
    default: 0
  },
  brokenEggs: {
    type: Number,
    default: 0
  },
  productionPercentage: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Add a virtual getter for total eggs
eggProductionSchema.virtual('totalEggs').get(function() {
  return this.morningEggs + this.noonEggs + this.eveningEggs;
});

// Make virtuals serializable
eggProductionSchema.set('toJSON', { virtuals: true });
eggProductionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EggProduction', eggProductionSchema);
