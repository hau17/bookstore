const express = require("express");
const router = express.Router();
const checkoutController = require("../../controllers/client/checkout_controller.js");

// Checkout giỏ hàng
router.get("/cart", checkoutController.getCheckoutCartPage);
router.post("/cart", checkoutController.postCheckoutCart);
// Mua ngay
router.get("/buy/:id", checkoutController.getBuyNowPage);
router.post("/buy/:id", checkoutController.postBuyNow);

//qr thanh toán
router.get("/qr", checkoutController.getQRCodePage);
module.exports = router;
