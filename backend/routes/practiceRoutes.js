const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, practiceController.recordPractice);
router.get('/history', optionalAuth, practiceController.getPracticeHistory);

module.exports = router;
