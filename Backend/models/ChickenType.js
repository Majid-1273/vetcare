// models/ChickenType.js
const mongoose = require('mongoose');

const chickenTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['broiler', 'layer', 'hybrid'],
    unique: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('ChickenType', chickenTypeSchema);