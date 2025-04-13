const User = require('../models/User');
const Farm = require('../models/Farm');

// Create new farm
exports.createFarm = async (req, res) => {
  try {
    const {
      farmName,
      location,
      ownerManager,
      contactPhone,
      contactEmail,
      farmCapacity,
      flockSize,
      registrationNumber,
      registrationAuthority,
      registrationDate
    } = req.body;

    const userId = req.userId; // assuming `userId` is available from JWT token

    const newFarm = new Farm({
      farmName,
      location,
      ownerManager,
      contactPhone,
      contactEmail,
      farmCapacity,
      flockSize,
      registrationNumber,
      registrationAuthority,
      registrationDate,
      userId
    });

    await newFarm.save();

    // Update user's farmDetails to true
    await User.findByIdAndUpdate(userId, { farmDetails: true });

    res.status(201).json({
      message: 'Farm registered successfully',
      farm: newFarm
    });
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get a specific farm
exports.getFarmsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const farms = await Farm.find({ userId: userId });

    if (!farms || farms.length === 0) {
      return res.status(404).json({ message: 'No farms found for this user' });
    }

    res.status(200).json({
      farms
    });
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
