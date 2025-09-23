const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/admin/customer_controller');

// Hiển thị danh sách khách hàng
router.get('/', customerController.list);

// Hiển thị chi tiết khách hàng
router.get('/:id', customerController.getCustomerById);

// Khóa khách hàng 
router.patch('/:id/status', customerController.lockCustomer);
module.exports = router;