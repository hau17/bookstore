const db = require('../../config/db.js');

exports.getAll = async (filter = '') => {
  let sql = `
    SELECT 
      o.order_id,
      u.fullname,
      o.address,
      o.order_date,
      o.total_amount,
      o.payment_status,
      os.status_id,
      os.status_name,
      p.payment_id,
      p.payment_name
    FROM orders o
    JOIN order_status os ON o.status_id = os.status_id
    JOIN payments p ON o.payment_id = p.payment_id
    JOIN users u ON o.user_id = u.user_id
  `;
  let values = [];

  if (filter === 'preparing') {
    sql += ' WHERE o.status_id = 2';
  } else if (filter === 'delivering') {
    sql += ' WHERE o.status_id = 3';
  } else if (filter === 'delivered') {
    sql += ' WHERE o.status_id = 4';
  } else if (filter === 'cancelled') {
    sql += ' WHERE o.status_id = 5';
  } else if (filter === 'waiting') {
    sql += ' WHERE o.status_id = 1';
  }

  try {
    const [orders] = await db.query(sql, values);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};


exports.getOrderDetails = async (orderId) => {
  const sql = `
    SELECT 
      od.order_detail_id,
      od.quantity,
      od.price,
      b.book_title
    FROM order_details od
    JOIN books b ON od.book_id = b.book_id
    WHERE od.order_id = ?
  `;
  try {
    const [details] = await db.query(sql, [orderId]);
    return details;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.updateStatus = async (orderId, statusId) => {
  const updateOrderSql = 'UPDATE orders SET status_id = ? WHERE order_id = ?';
  const insertHistorySql = 'INSERT INTO order_status_history (order_id, status_id) VALUES (?, ?)';
  
  try {
    await db.query('START TRANSACTION');
    
    // Cập nhật trạng thái đơn hàng
    const [updateResult] = await db.query(updateOrderSql, [statusId, orderId]);
    if (updateResult.affectedRows === 0) {
      throw new Error('Đơn hàng không tồn tại');
    }
    
    // Thêm lịch sử trạng thái
    await db.query(insertHistorySql, [orderId, statusId]);
    
    await db.query('COMMIT');
    return updateResult.affectedRows;
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating status:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};

// cập nhật trạng thái thanh toán
exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const sql = 'UPDATE orders SET payment_status = ? WHERE order_id = ?';
  try {
    const [result] = await db.query(sql, [paymentStatus, orderId]);
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};

exports.getAllStatuses = async () => {
  const sql = 'SELECT status_id, status_name FROM order_status';
  try {
    const [statuses] = await db.query(sql);
    return statuses;
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};