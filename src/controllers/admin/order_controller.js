const orderService = require('../../services/admin/order_service');

exports.list = async (req, res) => {
  try {
    const filter = req.query.filter || '';
    let orders;

    if (filter === 'undelivered') {
      orders = await orderService.getOrdersByStatus('undelivered');
    } else if (filter === 'delivered') {
      orders = await orderService.getOrdersByStatus('delivered');
    } else if (filter === 'cancelled') {
      orders = await orderService.getOrdersByStatus('cancelled');
    } else {
      orders = await orderService.getAll();
    }

    const statuses = await orderService.getAllStatuses();

    let title = 'Tất cả đơn hàng';
    if (filter === 'undelivered') title = 'Chưa giao';
    else if (filter === 'delivered') title = 'Đã giao';
    else if (filter === 'cancelled') title = 'Bị hủy';
    res.render('admin/orders/list', {
      layout: 'main-admin',
      title,
      orders,
      statuses,
      filter
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).send('Lỗi server');
  }
};


// Cập nhật trạng thái đơn hàng
exports.updateStatus = async (req, res) => {
  try {
    const order_id = req.params.id;
    const { status_id } = req.body;
    if (!order_id || !status_id) {
      return res.status(400).json({ error: 'Thiếu order_id hoặc status_id' });
    }
    const affectedRows = await orderService.updateStatus(order_id, status_id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Cập nhật trạng thái thất bại' });
  }
};

// Cập nhật trạng thái thanh toán đơn hàng
exports.updatePaymentStatus = async (req, res) => {
  try {
    const order_id = req.params.id;
    const { payment_status } = req.body;
    if (!order_id || payment_status === undefined) {
      return res.status(400).json({ error: 'Thiếu order_id hoặc payment_status' });
    }
    const affectedRows = await orderService.updatePaymentStatus(order_id, payment_status);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Cập nhật trạng thái thanh toán thất bại' });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const details = await orderService.getOrderDetails(orderId);
    res.json(details);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Lấy chi tiết thất bại' });
  }
};