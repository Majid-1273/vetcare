// routes/eggProduction.js
const express = require('express');
const router = express.Router();
const eggProductionController = require('../controllers/eggproduction');

router.post('/', eggProductionController.createEggProduction);
router.get('/batch/:batchId', eggProductionController.getEggProductionByBatch);
router.get('/:id', eggProductionController.getEggProductionById);
router.put('/:id', eggProductionController.updateEggProduction);
router.delete('/:id', eggProductionController.deleteEggProduction);

module.exports = router;