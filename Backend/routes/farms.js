const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');

router.post('/createFarm',  farmController.createFarm);

router.get('/:id',  farmController.getFarmsByUserId);

module.exports = router;
