const express = require('express');
const router = express.Router();
const authorController = require('../../controllers/admin/author_controller');

// Hiển thị danh sách tác giả
router.get('/', authorController.list);

// Hiển thị form thêm tác giả
router.get('/add', authorController.showAddForm);

// Xử lý thêm tác giả
router.post('/add', authorController.add);

// Hiển thị form sửa tác giả
router.get('/:id/edit', authorController.showEditForm);

// Cập nhật tác giả
router.put('/:id/edit', authorController.update);

// Hiển thị chi tiết tác giả
router.get('/:id', authorController.getById);

// Xóa tác giả
router.delete('/:id', authorController.delete);

module.exports = router;