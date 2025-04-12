// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.get('/login-history', verifyToken, authController.getLoginHistory);

module.exports = router;