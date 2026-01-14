const express = require("express");
const router = express.Router();
const accountController = require("../../controllers/admin/account_controller.js");

// Middleware kiểm tra đăng nhập
function checkUser(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

// Routes
// GET - Xem thông tin tài khoản
router.get("/", checkUser, accountController.getAccountPage);

// GET - Trang chỉnh sửa thông tin tài khoản
router.get("/edit", checkUser, accountController.getEditAccountPage);

// // POST - Cập nhật thông tin tài khoản
router.post("/edit", checkUser, accountController.updateAccount);

// // GET - Trang thay đổi mật khẩu
router.get(
  "/change-password",
  checkUser,
  accountController.getChangePasswordPage
);

// // POST - Thay đổi mật khẩu
router.post("/change-password", checkUser, accountController.updatePassword);

module.exports = router;
