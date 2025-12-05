const express = require("express");
const router = express.Router();
const productController = require("../../controllers/client/product_controller");

// Hiển thị danh sách sản phẩm
router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProductPage);

module.exports = router;
