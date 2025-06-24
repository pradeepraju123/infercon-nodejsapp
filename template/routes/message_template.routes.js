const express = require('express');
const router = express.Router();
const controller = require('../controllers/message_template.controller');
const upload = require('../middlewares/upload'); // Your file upload middleware

// Main Template Routes
router.post('/', upload.single('image'), controller.create);
router.get('/', controller.getAll);
// In message_template.routes.js
router.post('/json', controller.create); // Add this new route
// Sub-template Routes
router.post('/:parent_id/subtemplates', controller.createSubTemplates);
router.get('/:parent_id/subtemplates', controller.getSubTemplates);

module.exports = router;