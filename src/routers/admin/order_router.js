const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/order_controller');

// Hiển thị danh sách đơn hàng
router.get('/', orderController.list);

// Thay đổi trạng thái đơn hàng
router.post('/:id/status', orderController.updateStatus);
router.post('/:id/payment-status', orderController.updatePaymentStatus);

// Lấy chi tiết đơn hàng
router.get('/:id/details', orderController.getDetails);

module.exports = router;