const express = require("express");
const homeController = require("../../controllers/client/home_controller.js");
const productRouter = require("./product_router.js");
const accountRouter = require("./account_router.js");
const cartRouter = require("./cart_router.js");
const checkoutRouter = require("./checkout_route.js");
const router = express.Router();

function checkLogin(req, res, next) {
  if (req.session.customer) {
    next();
  } else {
    res.redirect("/account/login");
  }
}

// Login routes
router.get("/", homeController.getAllData);

router.use("/products", productRouter);

router.use("/account", accountRouter);
console.log("Cart router loaded:", typeof cartRouter);

router.use("/cart", checkLogin, cartRouter);

router.use("/checkout", checkLogin, checkoutRouter);

module.exports = router;
