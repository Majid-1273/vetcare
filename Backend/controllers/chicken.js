// controllers/chicken.js
const ChickenBatch = require('../models/ChickenBatch');
const ChickenType = require('../models/ChickenType');

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

// Create a new chicken batch
exports.createBatch = async (req, res) => {
  try {
    const { batchNumber, chickenTypeId, initialCount, startDate } = req.body;
    
    // Validate chicken type
    const chickenType = await ChickenType.findById(chickenTypeId);
    if (!chickenType) {
      return res.status(400).json({ message: 'Invalid chicken type' });
    }
    
    // Check if batch number already exists
    const existingBatch = await ChickenBatch.findOne({ batchNumber });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch number already exists' });
    }
    
    const batch = new ChickenBatch({
      batchNumber,
      chickenType: chickenTypeId,
      initialCount,
      currentCount: initialCount,
      startDate: startDate || new Date(),
      createdBy: req.userId
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
    const batches = await ChickenBatch.find()
      .populate('chickenType', 'name')
      .sort({ startDate: -1 });
    
    res.json(batches);
  } catch (error) {
    console.error('Get all batches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get batches by type
exports.getBatchesByType = async (req, res) => {
  try {
    const { typeId } = req.params;
    
    const batches = await ChickenBatch.find({ chickenType: typeId })
      .populate('chickenType', 'name')
      .sort({ startDate: -1 });
    
    res.json(batches);
  } catch (error) {
    console.error('Get batches by type error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get batch by ID
exports.getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const batch = await ChickenBatch.findById(id)
      .populate('chickenType', 'name');
    
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
    const { batchNumber, chickenTypeId, currentCount, active } = req.body;
    
    const batch = await ChickenBatch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Update fields if provided
    if (batchNumber) batch.batchNumber = batchNumber;
    if (chickenTypeId) {
      // Validate chicken type
      const chickenType = await ChickenType.findById(chickenTypeId);
      if (!chickenType) {
        return res.status(400).json({ message: 'Invalid chicken type' });
      }
      batch.chickenType = chickenTypeId;
    }
    if (currentCount) batch.currentCount = currentCount;
    if (active !== undefined) batch.active = active;
    
    await batch.save();
    
    res.json({
      message: 'Batch updated successfully',
      batch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
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