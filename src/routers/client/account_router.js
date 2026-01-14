const express = require("express");
const router = express.Router();
const accountController = require("../../controllers/client/account_controller.js");
const orderController = require("../../controllers/client/order_controller.js");
const { registerValidator } = require("../../validators/register_validator");

// Check authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  next();
};

// Public routes
router.get("/login", accountController.getLoginPage);
router.post("/login", accountController.postLogin);
router.get("/register", accountController.getRegisterPage);
router.post("/register", registerValidator, accountController.postRegister);
router.get("/logout", accountController.logout);

// Protected routes
router.get("/", requireAuth, accountController.getAccountPage);
router.get("/edit", requireAuth, accountController.getEditAccountPage);
router.post("/edit", requireAuth, accountController.postUpdateAccount);
router.get(
  "/change-password",
  requireAuth,
  accountController.getChangePasswordPage
);
router.post(
  "/change-password",
  requireAuth,
  accountController.postChangePassword
);

router.get("/orders", requireAuth, orderController.getOrdersPage);
router.get("/orders/:id", requireAuth, orderController.getOrderDetailsPage);
router.patch(
  "/orders/:id/cancel",
  requireAuth,
  orderController.postCancelOrder
);

module.exports = router;
