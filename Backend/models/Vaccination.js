const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  batchName: {
    type: String,
    required: true
  },
  petName: {
    type: String,
    required: true
  },
  vaccinationType: {
    type: String,
    required: true
  },
  dateGiven: {
    type: Date,
    required: true
  },
  nextDoseDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
