const express = require("express");
const router = express.Router();
const importController = require("../../controllers/admin/import_controller.js");

router.get("/", importController.listImports);
router.get("/new", importController.showImportForm);
router.post("/add", importController.addImport);

router.get("/:id/edit", importController.showEditForm);
router.patch("/:id/edit", importController.updateImport);

router.get("/:id", importController.getImportById);
router.patch("/:id/submit", importController.submitImport);
router.patch("/:id/recall", importController.recallImport);
router.patch("/:id/approve", importController.approveImport);
router.patch("/:id/reject", importController.rejectImport);
router.delete("/:id", importController.deleteImport);

module.exports = router;
