// middlewares/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const User = require('../models/User');
const LoginSession = require('../models/LoginSession');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, config.secret);
    req.userId = decoded.id;
    
    // Check if user exists
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if token is in active session
    const session = await LoginSession.findOne({ 
      userId: req.userId,
      status: 'active',
      token
    });
    
    if (!session) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Auto logout when token expires
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) {
          await LoginSession.findOneAndUpdate(
            { userId: decoded.id, status: 'active' },
            { status: 'expired', logoutTime: new Date() }
          );
        }
      } catch (e) {
        console.error('Error updating session on expired token:', e);
      }
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};