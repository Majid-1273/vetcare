// controllers/vaccination.js
const Vaccination = require('../models/Vaccination');
const ChickenBatch = require('../models/ChickenBatch');

// Create a new vaccination record
exports.createVaccination = async (req, res) => {
  try {
    const {
      batchId,
      vaccinationType,
      dateGiven,
      batchNumber,
      nextDoseDate,
      notes
    } = req.body;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    const vaccination = new Vaccination({
      batchId,
      vaccinationType,
      dateGiven,
      batchNumber,
      nextDoseDate,
      notes,
      createdBy: req.userId
    });
    
    await vaccination.save();
    
    res.status(201).json({
      message: 'Vaccination record created successfully',
      vaccination
    });
  } catch (error) {
    console.error('Create vaccination error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all vaccinations for a batch
exports.getVaccinationsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Validate batch
    const batch = await ChickenBatch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    const vaccinations = await Vaccination.find({ batchId })
      .sort({ dateGiven: -1 });
    
    res.json(vaccinations);
  } catch (error) {
    console.error('Get vaccinations by batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vaccination by ID
exports.getVaccinationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vaccination = await Vaccination.findById(id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }
    
    res.json(vaccination);
  } catch (error) {
    console.error('Get vaccination by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vaccination
exports.updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vaccinationType,
      dateGiven,
      batchNumber,
      nextDoseDate,
      notes
    } = req.body;
    
    const vaccination = await Vaccination.findById(id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }
    
    // Update fields if provided
    if (vaccinationType) vaccination.vaccinationType = vaccinationType;
    if (dateGiven) vaccination.dateGiven = dateGiven;
    if (batchNumber) vaccination.batchNumber = batchNumber;
    if (nextDoseDate !== undefined) vaccination.nextDoseDate = nextDoseDate;
    if (notes !== undefined) vaccination.notes = notes;
    
    await vaccination.save();
    
    res.json({
      message: 'Vaccination record updated successfully',
      vaccination
    });
  } catch (error) {
    console.error('Update vaccination error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete vaccination
exports.deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vaccination = await Vaccination.findByIdAndDelete(id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }
    
    res.json({ message: 'Vaccination record deleted successfully' });
  } catch (error) {
    console.error('Delete vaccination error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get upcoming vaccinations
exports.getUpcomingVaccinations = async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const vaccinations = await Vaccination.find({
      nextDoseDate: { $gte: now, $lte: nextWeek }
    })
      .populate('batchId', 'batchNumber')
      .sort({ nextDoseDate: 1 });
    
    res.json(vaccinations);
  } catch (error) {
    console.error('Get upcoming vaccinations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};