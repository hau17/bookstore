const express = require('express');
const router = express.Router();
const importController = require('../../controllers/admin/import_controller.js');

// Display import page
router.get('/', importController.list);

// Handle book import
router.post('/add', importController.addImport);

module.exports = router;