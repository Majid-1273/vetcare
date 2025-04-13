const Vaccination = require('../models/Vaccination');
const Batch = require('../models/ChickenBatch');

// Create a new vaccination record
exports.createVaccination = async (req, res) => {
  try {
    const {
      batchId,
      vaccinationType,
      dateGiven,
      nextDoseDate,
      petName
    } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }

    const vaccination = new Vaccination({
      batchId,
      batchName: batch.name,
      vaccinationType,
      dateGiven,
      nextDoseDate,
      petName,
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

    const batch = await Batch.findById(batchId);
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
      nextDoseDate,
      petName
    } = req.body;

    const vaccination = await Vaccination.findById(id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }

    if (vaccinationType) vaccination.vaccinationType = vaccinationType;
    if (dateGiven) vaccination.dateGiven = dateGiven;
    if (nextDoseDate !== undefined) vaccination.nextDoseDate = nextDoseDate;
    if (petName !== undefined) vaccination.petName = petName;

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
      .populate('batchId', 'name')
      .sort({ nextDoseDate: 1 });

    res.json(vaccinations);
  } catch (error) {
    console.error('Get upcoming vaccinations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
