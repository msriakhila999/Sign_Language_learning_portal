const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, translationController.saveTranslation);
router.get('/history', optionalAuth, translationController.getTranslationHistory);
router.delete('/history', optionalAuth, translationController.clearTranslationHistory);

module.exports = router;
