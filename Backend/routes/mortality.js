// routes/mortality.js
const express = require('express');
const router = express.Router();
const mortalityController = require('../controllers/mortality');

router.post('/', mortalityController.createMortalityRecord);
router.get('/batch/:batchId', mortalityController.getMortalityRecordsByBatch);
router.get('/:id', mortalityController.getMortalityRecordById);
router.put('/:id', mortalityController.updateMortalityRecord);
router.delete('/:id', mortalityController.deleteMortalityRecord);

module.exports = router;