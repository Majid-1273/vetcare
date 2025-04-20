// controllers/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginSession = require('../models/LoginSession');
const config = require('../config/jwt');
const Worker = require('../models/Worker');

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
    const { email, password, userType } = req.body;

    if (!userType) {
      return res.status(400).json({ message: 'User type is required' });
    }

    if (userType === 'Vet') {
      return res.status(200).json({ message: 'Vet login is in progress. Please check back later.' });
    }

    // For Farmer
    if (userType === 'Farmer') {
      const user = await User.findOne({ email, userType: 'Farmer' });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, config.secret, {});
      const session = new LoginSession({ userId: user._id, token });
      await session.save();

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          userType: user.userType,
          farmDetails: user.farmDetails
        }
      });
    }

    // For Worker
    if (userType === 'Worker') {
      const worker = await Worker.findOne({ email });
      if (!worker) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await worker.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: worker._id }, config.secret, {});
      const session = new LoginSession({ userId: worker._id, token });
      await session.save();

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: worker._id,
          username: worker.username,
          email: worker.email,
          userType: 'Worker',
          farmerId: worker.farmerId
        }
      });
    }

    return res.status(400).json({ message: 'Invalid user type' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.addWorker = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const farmerId = req.userId || req.body.farmerId; // Adjust this based on how you're sending farmer info

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


exports.getWorkers = async (req, res) => {
  try {
    const farmerId = req.userId || req.body.farmerId;

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    const workers = await Worker.find({ farmerId });

    res.json({ workers });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.updateWorker = async (req, res) => {
  try {
    const { workerId, username, email, password } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: 'Worker ID is required' });
    }

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (username) worker.username = username;
    if (email) worker.email = email;
    if (password) worker.password = password; 

    await worker.save();

    res.json({ message: 'Worker updated successfully', worker });
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.deleteWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    if (!workerId) {
      return res.status(400).json({ message: 'Worker ID is required' });
    }

    const deletedWorker = await Worker.findByIdAndDelete(workerId);

    if (!deletedWorker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
