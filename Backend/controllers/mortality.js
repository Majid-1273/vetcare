// controllers/mortality.js
const MortalityRecord = require('../models/MortalityRecord');
const ChickenBatch = require('../models/ChickenBatch');

// Create a new mortality record
exports.createMortalityRecord = async (req, res) => {
  try {
    const {
      batchId,
      date,
      deadBirdsCount,
      notes
    } = req.body;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    // Check if record for this date already exists
    const existingRecord = await MortalityRecord.findOne({
      batchId,
      date: new Date(date)
    });
    
    if (existingRecord) {
      return res.status(400).json({ message: 'Mortality record for this date already exists' });
    }
    
    // Get previous cumulative loss
    const previousRecord = await MortalityRecord.findOne({ batchId })
      .sort({ date: -1 });
    
    const previousCumulativeLoss = previousRecord ? previousRecord.cumulativeLoss : 0;
    const totalBirdsCount = batch.currentCount + deadBirdsCount; // Current count is already reduced by dead birds
    
    // Calculate mortality rate and cumulative loss
    const mortalityRate = (deadBirdsCount / totalBirdsCount) * 100;
    const cumulativeLoss = previousCumulativeLoss + deadBirdsCount;
    
    const mortalityRecord = new MortalityRecord({
      batchId,
      date,
      totalBirdsCount,
      deadBirdsCount,
      mortalityRate,
      cumulativeLoss,
      notes,
      createdBy: req.userId
    });
    
    await mortalityRecord.save();
    
    // Update batch current count
    batch.currentCount = totalBirdsCount - deadBirdsCount;
    await batch.save();
    
    res.status(201).json({
      message: 'Mortality record created successfully',
      mortalityRecord
    });
  } catch (error) {
    console.error('Create mortality record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all mortality records for a batch
exports.getMortalityRecordsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    const mortalityRecords = await MortalityRecord.find({ batchId })
      .sort({ date: -1 });
    
    res.json(mortalityRecords);
  } catch (error) {
    console.error('Get mortality records by batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get mortality record by ID
exports.getMortalityRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mortalityRecord = await MortalityRecord.findById(id);
    if (!mortalityRecord) {
      return res.status(404).json({ message: 'Mortality record not found' });
    }
    
    res.json(mortalityRecord);
  } catch (error) {
    console.error('Get mortality record by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update mortality record
exports.updateMortalityRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      deadBirdsCount,
      notes
    } = req.body;
    
    const mortalityRecord = await MortalityRecord.findById(id);
    if (!mortalityRecord) {
      return res.status(404).json({ message: 'Mortality record not found' });
    }
    
    // Get batch
    const batch = await ChickenBatch.findById(mortalityRecord.batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Batch not found' });
    }
    
    // Calculate new values
    const oldDeadBirdsCount = mortalityRecord.deadBirdsCount;
    const newDeadBirdsCount = deadBirdsCount !== undefined ? deadBirdsCount : oldDeadBirdsCount;
    
    // Adjust batch current count based on change in dead birds count
    const deadBirdsDifference = newDeadBirdsCount - oldDeadBirdsCount;
    batch.currentCount = batch.currentCount - deadBirdsDifference;
    await batch.save();
    
    // Calculate new mortality rate
    const totalBirdsCount = batch.currentCount + newDeadBirdsCount;
    const mortalityRate = (newDeadBirdsCount / totalBirdsCount) * 100;
    
    // Update record
    if (date) mortalityRecord.date = date;
    if (deadBirdsCount !== undefined) {
      mortalityRecord.deadBirdsCount = deadBirdsCount;
      mortalityRecord.totalBirdsCount = totalBirdsCount;
      mortalityRecord.mortalityRate = mortalityRate;
      
      // Update cumulative loss for this and all subsequent records
      const affectedRecords = await MortalityRecord.find({
        batchId: mortalityRecord.batchId,
        date: { $gte: mortalityRecord.date }
      }).sort({ date: 1 });
      
      let cumulativeLoss = 0;
      
      // Get previous cumulative loss
      const previousRecord = await MortalityRecord.findOne({
        batchId: mortalityRecord.batchId,
        date: { $lt: mortalityRecord.date }
      }).sort({ date: -1 });
      
      cumulativeLoss = previousRecord ? previousRecord.cumulativeLoss : 0;
      
      // Update all affected records
      for (const record of affectedRecords) {
        cumulativeLoss += record === mortalityRecord ? newDeadBirdsCount : record.deadBirdsCount;
        record.cumulativeLoss = cumulativeLoss;
        await record.save();
      }
    }
    
    if (notes !== undefined) mortalityRecord.notes = notes;
    
    await mortalityRecord.save();
    
    res.json({
      message: 'Mortality record updated successfully',
      mortalityRecord
    });
  } catch (error) {
    console.error('Update mortality record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete mortality record
exports.deleteMortalityRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mortalityRecord = await MortalityRecord.findById(id);
    if (!mortalityRecord) {
      return res.status(404).json({ message: 'Mortality record not found' });
    }
    
    // Get batch
    const batch = await ChickenBatch.findById(mortalityRecord.batchId);
    if (batch) {
      // Add back the dead birds to the current count
      batch.currentCount += mortalityRecord.deadBirdsCount;
      await batch.save();
    }
    
    // Update cumulative loss for all subsequent records
    const subsequentRecords = await MortalityRecord.find({
      batchId: mortalityRecord.batchId,
      date: { $gt: mortalityRecord.date }
    }).sort({ date: 1 });
    
    if (subsequentRecords.length > 0) {
      // Get previous cumulative loss
      const previousRecord = await MortalityRecord.findOne({
        batchId: mortalityRecord.batchId,
        date: { $lt: mortalityRecord.date }
      }).sort({ date: -1 });
      
      let cumulativeLoss = previousRecord ? previousRecord.cumulativeLoss : 0;
      
      // Update all subsequent records
      for (const record of subsequentRecords) {
        cumulativeLoss += record.deadBirdsCount;
        record.cumulativeLoss = cumulativeLoss;
        await record.save();
      }
    }
    
    await MortalityRecord.findByIdAndDelete(id);
    
    res.json({ message: 'Mortality record deleted successfully' });
  } catch (error) {
    console.error('Delete mortality record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};