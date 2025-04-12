// models/Vaccination.js
const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChickenBatch',
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
  batchNumber: {
    type: String,
    required: true
  },
  nextDoseDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);