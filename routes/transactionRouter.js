const express = require('express');
const router = express.Router();
const fincraController = require('../controllers/transactionController');

// POST /api/fincras/initialize
router.post('/initialize', fincraController.initializePayment);

// GET /api/fincras/verify/:reference
router.get('/verify/:reference', fincraController.verifyPayment);

// POST /api/fincras/webhook
router.post('/webhook', fincraController.handleWebhook);

module.exports = router;
