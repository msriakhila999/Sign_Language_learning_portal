const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/dashboard/stats', optionalAuth, progressController.getDashboardStats);
router.get('/progress', optionalAuth, progressController.getProgress);

module.exports = router;
