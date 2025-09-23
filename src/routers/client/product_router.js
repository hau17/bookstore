const express = require('express');
const router = express.Router();
const productController = require('../../controllers/client/product_controller');

// Hiển thị danh sách sản phẩm
router.get('/', productController.list);

// Hiển thị form thêm sản phẩm
router.get('/add', productController.showAddForm);

// Xử lý thêm sản phẩm
router.post('/add', productController.add);

// Hiển thị form sửa sản phẩm
router.get('/edit/:id', productController.showEditForm);

// Cập nhật sản phẩm
router.post('/edit/:id', productController.update);

// Xoá sản phẩm
router.post('/delete/:id', productController.delete);

module.exports = router;
