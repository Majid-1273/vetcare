// routes/feed.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');

router.post('/', feedController.createFeedRecord);
router.get('/batch/:batchId', feedController.getFeedRecordsByBatch);
router.get('/:id', feedController.getFeedRecordById);
router.put('/:id', feedController.updateFeedRecord);
router.delete('/:id', feedController.deleteFeedRecord);

module.exports = router;