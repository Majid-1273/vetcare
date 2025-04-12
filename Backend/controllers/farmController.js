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
exports.getFarmById = async (req, res) => {
  try {
    const farmId = req.params.id;
    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.status(200).json({
      farm
    });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
