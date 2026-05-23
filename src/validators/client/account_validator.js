const { body } = require("express-validator");

exports.editAccountValidator = [
  body("fullname").trim().notEmpty().withMessage("Họ tên không được để trống"),

  body("email").trim().isEmail().withMessage("Email không đúng định dạng"),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại không được để trống")
    .matches(/^[0-9]{10,11}$/)
    .withMessage("Số điện thoại phải có 10-11 chữ số"),

  body("address").trim().notEmpty().withMessage("Địa chỉ không được để trống"),
];
