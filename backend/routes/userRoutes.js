const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/profile', optionalAuth, userController.getProfile);
router.put('/profile', optionalAuth, userController.updateProfile);

module.exports = router;
