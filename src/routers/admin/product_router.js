const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/product_controller');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/img/products'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// Hiển thị danh sách sản phẩm
router.get('/', productController.list);

// Hiển thị form thêm sản phẩm
router.get('/add', productController.showAddForm);

// Xử lý thêm sản phẩm
router.post('/add', upload.single('image_path'), productController.add);

// Hiển thị form sửa sản phẩm
router.get('/:id/edit', productController.showEditForm);

// Cập nhật sản phẩm
router.put('/:id', upload.single('image_path'), productController.edit);

// Hiển thị chi tiết sản phẩm
router.get('/:id', productController.getProductById);

// Cập nhật trạng thái sản phẩm (khóa/mở khóa)
router.patch('/:id/status', productController.toggleStatus);
// Xóa sản phẩm
// router.delete('/:id', productController.delete);
module.exports = router;