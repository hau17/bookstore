const { body } = require("express-validator");

exports.registerValidator = [
  body("fullname").trim().notEmpty().withMessage("Họ tên không được để trống"),

  body("email").trim().isEmail().withMessage("Email không đúng định dạng"),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại không được để trống"),

  body("address").trim().notEmpty().withMessage("Địa chỉ không được để trống"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu tối thiểu 6 ký tự"),

  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Mật khẩu xác nhận không khớp");
    }
    return true;
  }),
];
