// routes/chicken.js
const express = require('express');
const router = express.Router();
const chickenController = require('../controllers/chicken');

// Chicken types
router.get('/types', chickenController.getAllChickenTypes);
router.post('/types/initialize', chickenController.initializeChickenTypes);

// Chicken batches
router.post('/batches', chickenController.createBatch);
router.get('/batches', chickenController.getAllBatches);
router.get('/batches/type/:typeId', chickenController.getBatchesByType);
router.get('/batches/:id', chickenController.getBatchById);
router.put('/batches/:id', chickenController.updateBatch);
router.delete('/batches/:id', chickenController.deleteBatch);

module.exports = router;