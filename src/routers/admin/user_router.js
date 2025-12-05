const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/user_controller");

// Hiển thị danh sách người dùng
router.get("/", userController.list);

// Hiển thị trang thêm người dùng
router.get("/add", userController.showAddForm);

// Xử lý thêm người dùng
router.post("/add", userController.add);

// Hiển thị trang chỉnh sửa người dùng
router.get("/:id/edit", userController.showEditForm);

// Xử lý chỉnh sửa người dùng
router.post("/:id/edit", userController.edit);

// Xử lý xóa khóa người dùng
router.patch("/:id/status", userController.toggleStatus);

module.exports = router;
