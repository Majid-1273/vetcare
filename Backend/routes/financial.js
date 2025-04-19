const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');

// Broiler financial routes
router.get('/broiler', financialController.getBroilerFinancials);
router.put('/broiler', financialController.updateBroilerFinancials);

// Layer financial routes
router.get('/layer', financialController.getLayerFinancials);
router.get('/mortality', financialController.getMortalityRecord);
router.put('/layer', financialController.updateLayerFinancials);
router.get('/eggRecords', financialController.getEggRecord);

module.exports = router;