const express = require('express');
const router = express.Router();
const publisherController = require('../../controllers/admin/publisher_controller');

// Hiển thị danh sách nhà xuất bản
router.get('/', publisherController.list);

// Hiển thị form thêm nhà xuất bản
router.get('/add', publisherController.showAddForm);

// Xử lý thêm nhà xuất bản
router.post('/add', publisherController.add);

// Hiển thị form sửa nhà xuất bản
router.get('/:id/edit', publisherController.showEditForm);

// Cập nhật nhà xuất bản
router.put('/:id/edit', publisherController.update);

// Hiển thị chi tiết nhà xuất bản
router.get('/:id', publisherController.getById);

// Cập nhật trạng thái nhà xuất bản (khóa/mở khóa)
router.patch('/:id/status', publisherController.toggleStatus);
module.exports = router;
