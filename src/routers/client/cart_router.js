const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/client/cart_controller.js");

// Display cart page
router.get("/", cartController.getCartPage);

// AJAX routes for cart operations
router.post("/add", cartController.addToCart);
router.post("/update", cartController.updateCartItem);

// Form submit route for removing items (non-AJAX, redirects)
router.post("/remove", cartController.removeCartItem);

module.exports = router;
