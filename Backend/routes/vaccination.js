// routes/vaccination.js
const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccination');

router.post('/', vaccinationController.createVaccination);
router.get('/batch/:batchId', vaccinationController.getVaccinationsByBatch);
router.get('/upcoming', vaccinationController.getUpcomingVaccinations);
router.get('/:id', vaccinationController.getVaccinationById);
router.put('/:id', vaccinationController.updateVaccination);
router.delete('/:id', vaccinationController.deleteVaccination);

module.exports = router;