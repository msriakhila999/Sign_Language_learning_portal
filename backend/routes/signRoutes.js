const express = require('express');
const router = express.Router();
const signController = require('../controllers/signController');

router.get('/', signController.getSigns);
router.get('/:id', signController.getSignById);

module.exports = router;
