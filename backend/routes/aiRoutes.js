const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

// GET /api/ai/status
router.get('/status', aiController.getStatus);

// POST /api/ai/chat
router.post('/chat', optionalAuth, aiController.chat);

module.exports = router;
