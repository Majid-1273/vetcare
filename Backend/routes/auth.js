// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/worker/add', verifyToken, authController.addWorker);
router.get('/workers', verifyToken, authController.getWorkers);
router.put('/worker/update', verifyToken, authController.updateWorker);
router.delete('/worker/delete/:workerId', verifyToken, authController.deleteWorker);

module.exports = router;
