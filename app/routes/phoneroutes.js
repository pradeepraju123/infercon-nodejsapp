const express = require('express');
const router = express.Router();
const phoneController = require('../controller/phonecontroller');

// POST /api/v1/phone/validate
router.post('/validate', phoneController.validatePhoneNumber);

// Export the router
module.exports = router;