const MortalityRecord = require('../models/MortalityRecord');
const ChickenBatch = require('../models/ChickenBatch');

exports.createMortalityRecord = async (req, res) => {
  try {
    const { batchId, date, deadBirdsCount } = req.body;

    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }

    // Check if record already exists for this date
    const existingRecord = await MortalityRecord.findOne({
      batchId,
      date: new Date(date),
    });

    if (existingRecord) {
      return res.status(400).json({
        message: 'A mortality record already exists for this date',
      });
    }

    // Get the last mortality record
    const previousRecord = await MortalityRecord.findOne({ batchId }).sort({ date: -1 });

    // Determine totalBirdsCount from last record, or use batch.initialCount
    const totalBirdsCount = previousRecord
      ? previousRecord.totalBirdsCount - previousRecord.deadBirdsCount
      : batch.initialCount;

    // Final safety check
    if (totalBirdsCount <= 0) {
      return res.status(400).json({ message: 'No remaining birds in this batch' });
    }

    // Calculate mortality rate and cumulative loss
    const mortalityRate = (deadBirdsCount / totalBirdsCount) * 100;
    const cumulativeLoss = previousRecord
      ? previousRecord.cumulativeLoss + deadBirdsCount
      : deadBirdsCount;

    const mortalityRecord = new MortalityRecord({
      batchId,
      date: new Date(date),
      totalBirdsCount,
      deadBirdsCount,
      mortalityRate,
      cumulativeLoss,
      createdBy: req.userId,
    });

    await mortalityRecord.save();

    res.status(201).json({
      message: 'Mortality record created successfully',
      mortalityRecord,
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
      deadBirdsCount
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