const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category_controller');

// Hiển thị danh sách loại sản phẩm
router.get('/', categoryController.list);

// Hiển thị form thêm loại sản phẩm
router.get('/add', categoryController.showAddForm);

// Xử lý thêm loại sản phẩm
router.post('/add', categoryController.add);

// Hiển thị form sửa loại sản phẩm
router.get('/:id/edit', categoryController.showEditForm);

// Cập nhật loại sản phẩm
router.put('/:id/edit', categoryController.update);

// Cập nhật trạng thái loại sản phẩm (khóa/mở khóa)
router.patch('/:id/status', categoryController.toggleStatus);

module.exports = router;