// controllers/feed.js
const FeedRecord = require('../models/FeedRecord');
const ChickenBatch = require('../models/ChickenBatch');

// Create a new feed record
exports.createFeedRecord = async (req, res) => {
  try {
    const {
      batchId,
      ageGroup,
      feedType,
      avgConsumptionPerBird,
      totalFeedUsed
    } = req.body;

    // Validate that the batchId exists in the ChickenBatch collection
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID. The batch does not exist.' });
    }

    const feedRecord = new FeedRecord({
      batchId,
      ageGroup,
      feedType,
      avgConsumptionPerBird,
      totalFeedUsed,
      createdBy: req.userId  // Assuming userId is passed from middleware
    });

    await feedRecord.save();

    res.status(201).json({
      message: 'Feed record created successfully',
      feedRecord
    });
  } catch (error) {
    console.error('Create feed record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all feed records for a batch
exports.getFeedRecordsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    const feedRecords = await FeedRecord.find({ batchId })
      .sort({ createdAt: 1 });
    
    res.json(feedRecords);
  } catch (error) {
    console.error('Get feed records by batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get feed record by ID
exports.getFeedRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedRecord = await FeedRecord.findById(id);
    if (!feedRecord) {
      return res.status(404).json({ message: 'Feed record not found' });
    }
    
    res.json(feedRecord);
  } catch (error) {
    console.error('Get feed record by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update feed record
exports.updateFeedRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      ageGroup, 
      feedType, 
      avgConsumptionPerBird, 
      totalFeedUsed 
    } = req.body;
    
    const feedRecord = await FeedRecord.findById(id);
    if (!feedRecord) {
      return res.status(404).json({ message: 'Feed record not found' });
    }
    
    // Update fields if provided
    if (ageGroup) feedRecord.ageGroup = ageGroup;
    if (feedType) feedRecord.feedType = feedType;
    if (avgConsumptionPerBird !== undefined) feedRecord.avgConsumptionPerBird = avgConsumptionPerBird;
    if (totalFeedUsed !== undefined) feedRecord.totalFeedUsed = totalFeedUsed;
    
    await feedRecord.save();
    
    res.json({
      message: 'Feed record updated successfully',
      feedRecord
    });
  } catch (error) {
    console.error('Update feed record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete feed record
exports.deleteFeedRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedRecord = await FeedRecord.findByIdAndDelete(id);
    if (!feedRecord) {
      return res.status(404).json({ message: 'Feed record not found' });
    }
    
    res.json({ message: 'Feed record deleted successfully' });
  } catch (error) {
    console.error('Delete feed record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
