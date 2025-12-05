const express = require("express");
const router = express.Router();
const importController = require("../../controllers/admin/import_controller.js");

// Display imports list (history)
router.get("/", importController.listImports);

// Show import form (select books to import)
router.get("/new", importController.showImportForm);

// Get import details (JSON)
router.get("/:id", importController.getImportById);

// Handle book import
router.post("/add", importController.addImport);

module.exports = router;
