const express = require("express");
const router = express.Router();
const productRouter = require("./product_router.js");
const authorRouter = require("./author_router.js");
const orderRouter = require("./order_router.js");
const customerRouter = require("./customer_router.js");
const homeController = require("../../controllers/admin/home_controller.js");
const publisherRouter = require("./publisher_router.js");
const categoryRouter = require("./category_router.js");
const importRouter = require("./import_router.js");
const userRouter = require("./user_router.js");

// Middleware kiểm tra đăng nhập admin
function checkUser(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

// Login routes
router.get("/login", homeController.getLoginPage);
router.post("/login", homeController.postLogin);

router.get("/", checkUser, (req, res) => {
  res.render("admin/home", { layout: "main-admin" });
});

// Các router con chỉ cho user đã đăng nhập truy cập
router.use("/products", checkUser, productRouter);
router.use("/authors", checkUser, authorRouter);
router.use("/orders", checkUser, orderRouter);
router.use("/customers", checkUser, customerRouter);
router.use("/publishers", checkUser, publisherRouter);
router.use("/categories", checkUser, categoryRouter);
router.use("/imports", checkUser, importRouter);
router.use("/users", checkUser, userRouter);

// Logout route
router.get("/logout", homeController.logout);
module.exports = router;
