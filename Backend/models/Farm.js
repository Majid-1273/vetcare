// models/Farm.js
const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  farmName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  ownerManager: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  farmCapacity: {
    type: Number,
    required: true
  },
  flockSize: {
    type: Number
  },
  registrationNumber: {
    type: String
  },
  registrationAuthority: {
    type: String
  },
  registrationDate: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farm', farmSchema);
