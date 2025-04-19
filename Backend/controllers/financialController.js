const BroilerFinancial = require('../models/BroilerFinancial');
const LayerFinancial = require('../models/LayerFinancial');
const ChickenBatch = require('../models/ChickenBatch');
const MortalityRecord = require('../models/MortalityRecord');
const EggProduction = require('../models/EggProduction');

// Get broiler financial data for a user
exports.getBroilerFinancials = async (req, res) => {
  try {
    const userId = req.userId;
    
    let financials = await BroilerFinancial.findOne({ userId });
    
    if (!financials) {
      // Create default record if none exists
      financials = new BroilerFinancial({ userId });
      await financials.save();
    }
    
    res.status(200).json(financials);
  } catch (error) {
    console.error('Error fetching broiler financial data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update broiler financial data
exports.updateBroilerFinancials = async (req, res) => {
  try {
    const userId = req.userId;
    const { revenue, costs } = req.body;
    
    // Find and update the record
    const updatedFinancials = await BroilerFinancial.findOneAndUpdate(
      { userId },
      { revenue, costs },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      message: 'Broiler financial data updated successfully',
      financials: updatedFinancials
    });
  } catch (error) {
    console.error('Error updating broiler financial data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Layer Financial Operations

// Get layer financial data for a user
exports.getLayerFinancials = async (req, res) => {
  try {
    const userId = req.userId;
    
    let financials = await LayerFinancial.findOne({ userId });
    
    if (!financials) {
      // Create default record if none exists
      financials = new LayerFinancial({ userId });
      await financials.save();
    }
    
    res.status(200).json(financials);
  } catch (error) {
    console.error('Error fetching layer financial data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update layer financial data
exports.updateLayerFinancials = async (req, res) => {
  try {
    const userId = req.userId;
    const { revenue, costs } = req.body;
    
    // Find and update the record
    const updatedFinancials = await LayerFinancial.findOneAndUpdate(
      { userId },
      { revenue, costs },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      message: 'Layer financial data updated successfully',
      financials: updatedFinancials
    });
  } catch (error) {
    console.error('Error updating layer financial data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMortalityRecord = async (req, res) => {
  try {
    const batches = await ChickenBatch.find({ farmerId: req.userId }).sort({ placementDate: -1 });

    const batchIds = batches.map(batch => batch._id);

    const mortalityRecords = await MortalityRecord.find({ batchId: { $in: batchIds } })
      .sort({ date: -1 });

    res.status(200).json({ mortalityRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch mortality records" });
  }
};


exports.getEggRecord = async (req, res) => {
  try {
    const batches = await ChickenBatch.find({ farmerId: req.userId }).sort({ placementDate: -1 });

    const batchIds = batches.map(batch => batch._id);

    const eggRecords = await EggProduction.find({ batchId: { $in: batchIds } })
      .sort({ date: -1 });

    res.status(200).json({ eggRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch egg records" });
  }
};
