// models/LoginSession.js
const mongoose = require('mongoose');

const loginSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'logout'],
    default: 'active'
  }
});

module.exports = mongoose.model('LoginSession', loginSessionSchema);