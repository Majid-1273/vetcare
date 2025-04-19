const ChickenBatch = require('../models/ChickenBatch');
const ChickenType = require('../models/ChickenType');
const MortalityRecord = require('../models/MortalityRecord');

// Get all chicken types
exports.getAllChickenTypes = async (req, res) => {
  try {
    const types = await ChickenType.find();
    res.json(types);
  } catch (error) {
    console.error('Get all chicken types error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Initialize chicken types if they don't exist
exports.initializeChickenTypes = async (req, res) => {
  try {
    const count = await ChickenType.countDocuments();

    if (count === 0) {
      const types = [
        { name: 'broiler', description: 'Broiler chicken type' },
        { name: 'layer', description: 'Layer chicken type' },
        { name: 'hybrid', description: 'Hybrid chicken type' }
      ];

      await ChickenType.insertMany(types);
      return res.status(201).json({ message: 'Chicken types initialized successfully', types });
    }

    res.json({ message: 'Chicken types already initialized' });
  } catch (error) {
    console.error('Initialize chicken types error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new chicken batch with auto-generated ID
exports.createBatch = async (req, res) => {
  try {
    const { name, breed, breedType, placementDate, initialCount } = req.body;

    const batch = new ChickenBatch({
      name,
      breed,
      breedType,
      placementDate,
      initialCount,
      farmerId: req.userId // Add the farmer's ID from the authenticated user
    });

    await batch.save();

    res.status(201).json({
      message: 'Chicken batch created successfully',
      batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await ChickenBatch.find({ farmerId: req.userId }).sort({ placementDate: -1 });

    const batchWithCurrentCount = await Promise.all(
      batches.map(async (batch) => {
        const mortalityRecords = await MortalityRecord.find({ batchId: batch._id });

        const totalDeaths = mortalityRecords.reduce((sum, record) => sum + record.deadBirdsCount, 0);
        const currentCount = batch.initialCount - totalDeaths;

        return {
          ...batch._doc,
          currentCount,
        };
      })
    );

    res.json(batchWithCurrentCount);
  } catch (error) {
    console.error('Get all batches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get batch by generated ID (e.g., BATCH-001)
exports.getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await ChickenBatch.findOne({ id });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);
  } catch (error) {
    console.error('Get batch by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update batch
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, breed, breedType, initialCount, placementDate } = req.body;

    const batch = await ChickenBatch.findOne({ id });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (name) batch.name = name;
    if (breed) batch.breed = breed;
    if (breedType) batch.breedType = breedType;
    if (placementDate) batch.placementDate = placementDate;
    if (initialCount !== undefined) batch.initialCount = initialCount;

    await batch.save();

    res.json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    const batch = await ChickenBatch.findByIdAndDelete(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }


    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
