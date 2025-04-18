// controllers/eggProduction.js
const EggProduction = require('../models/EggProduction');
const ChickenBatch = require('../models/ChickenBatch');

// Create a new egg production record
exports.createEggProduction = async (req, res) => {
  try {
    const {
      batchId,
      date,
      morningEggs,
      noonEggs,
      eveningEggs,
      brokenEggs
    } = req.body;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    if (!batch || (batch.breedType !== 'layer' && batch.breedType !== 'hybrid')) {
      return res.status(400).json({ message: 'Egg production records can only be added for layer or hybrid chicken types' });
    }
    
    // Check if record for this date already exists
    const existingRecord = await EggProduction.findOne({
      batchId,
      date: new Date(date)
    });
    
    if (existingRecord) {
      return res.status(400).json({ message: 'Egg production record for this date already exists' });
    }
    
    // Ensure values are numbers with defaults of 0
    const morning = parseInt(morningEggs) || 0;
    const noon = parseInt(noonEggs) || 0;
    const evening = parseInt(eveningEggs) || 0;
    const broken = parseInt(brokenEggs) || 0;
    
    // Calculate production percentage correctly
    const totalEggs = morning + noon + evening;
    const effectiveEggs = totalEggs - broken;
    const productionPercentage = totalEggs > 0 ? (effectiveEggs / totalEggs) * 100 : 0;
    
    const eggProduction = new EggProduction({
      batchId,
      date,
      morningEggs: morning,
      noonEggs: noon,
      eveningEggs: evening,
      brokenEggs: broken,
      productionPercentage,
      createdBy: req.userId
    });
    
    await eggProduction.save();
    
    res.status(201).json({
      message: 'Egg production record created successfully',
      eggProduction
    });
  } catch (error) {
    console.error('Create egg production error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get all egg production records for a batch
exports.getEggProductionByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    const eggProductions = await EggProduction.find({ batchId })
      .sort({ date: -1 });
    
    res.json(eggProductions);
  } catch (error) {
    console.error('Get egg production by batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get egg production record by ID
exports.getEggProductionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eggProduction = await EggProduction.findById(id);
    if (!eggProduction) {
      return res.status(404).json({ message: 'Egg production record not found' });
    }
    
    res.json(eggProduction);
  } catch (error) {
    console.error('Get egg production by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update egg production record
exports.updateEggProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      morningEggs,
      noonEggs,
      eveningEggs,
      brokenEggs
    } = req.body;
    
    const eggProduction = await EggProduction.findById(id);
    if (!eggProduction) {
      return res.status(404).json({ message: 'Egg production record not found' });
    }
    
    // Update fields if provided
    if (date) eggProduction.date = date;
    if (morningEggs !== undefined) eggProduction.morningEggs = morningEggs;
    if (noonEggs !== undefined) eggProduction.noonEggs = noonEggs;
    if (eveningEggs !== undefined) eggProduction.eveningEggs = eveningEggs;
    if (brokenEggs !== undefined) eggProduction.brokenEggs = brokenEggs;
    
    // Recalculate production percentage
    const totalEggs = eggProduction.morningEggs + eggProduction.noonEggs + eggProduction.eveningEggs;
    const effectiveEggs = totalEggs - eggProduction.brokenEggs;
    eggProduction.productionPercentage = totalEggs > 0 ? (effectiveEggs / totalEggs) * 100 : 0;
    
    await eggProduction.save();
    
    res.json({
      message: 'Egg production record updated successfully',
      eggProduction
    });
  } catch (error) {
    console.error('Update egg production error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete egg production record
exports.deleteEggProduction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eggProduction = await EggProduction.findByIdAndDelete(id);
    if (!eggProduction) {
      return res.status(404).json({ message: 'Egg production record not found' });
    }
    
    res.json({ message: 'Egg production record deleted successfully' });
  } catch (error) {
    console.error('Delete egg production error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};