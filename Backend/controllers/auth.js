// controllers/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginSession = require('../models/LoginSession');
const config = require('../config/jwt');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      username,
      email,
      password,
      userType
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.secret, {
      
    });

    // Create a login session
    const session = new LoginSession({
      userId: user._id,
      token
    });

    await session.save();

    // Return same structure as login
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        farmDetails:user.farmDetails
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.secret, {
    });

    // Create a login session
    const session = new LoginSession({
      userId: user._id,
      token
    });

    await session.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        farmDetails:user.farmDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addWorker = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const farmerId = req.user?.id || req.body.farmerId; // Adjust this based on how you're sending farmer info

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    // Check if worker email already exists
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: 'Email already registered for a worker' });
    }

    // Create new worker
    const worker = new Worker({
      username,
      email,
      password,
      farmerId
    });

    await worker.save();

    res.status(201).json({
      message: 'Worker added successfully',
      worker: {
        id: worker._id,
        username: worker.username,
        email: worker.email,
        farmerId: worker.farmerId
      }
    });
  } catch (error) {
    console.error('Add worker error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
