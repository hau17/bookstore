const db = require("../../config/db.js");

exports.getCustomerOrders = async ({ cus_id, order_status }) => {
  let sql = `
    SELECT 
      o.order_id,
      o.created_at,
      o.total_amount,
      o.total_quantity,
      o.payment_id,
      o.payment_status,
      o.status_id,
      os.status_name,
      p.payment_name
    FROM orders o
    JOIN order_status os ON o.status_id = os.status_id
    JOIN payments p ON o.payment_id = p.payment_id
    WHERE o.cus_id = ?
  `;

  const params = [cus_id];

  if (order_status) {
    sql += " AND o.status_id = ?";
    params.push(order_status);
  }

  sql += " ORDER BY o.order_id DESC";

  const [orders] = await db.query(sql, params);
  return orders;
};

exports.getOrderById = async ({ order_id, cus_id }) => {
  const sql = `
    SELECT
      o.order_id,
      o.cus_id,
      o.address,
      o.phone_number,
      o.created_at,
      o.total_amount,
      o.total_quantity,
      o.payment_status,
      o.payment_id
    FROM orders o
    WHERE o.order_id = ? AND o.cus_id = ?
    LIMIT 1
  `;
  try {
    console.log("order id ở oder service:", order_id, "cus_id:", cus_id);
    const [rows] = await db.query(sql, [order_id, cus_id]);
    if (rows.length === 0) {
      throw new Error("Đơn hàng không tồn tại");
    }
    return rows[0];
  } catch (error) {
    console.error("Get Order By ID Error:", error.message);
    throw error;
  }
};

exports.getOrderDetails = async ({ cus_id, order_id }) => {
  // Get order header info
  const headerSql = `
    SELECT 
      o.order_id,
      o.created_at,
      o.phone_number,
      o.address,
      o.total_amount,
      o.total_quantity,
      o.payment_id,
      o.payment_status,
      o.status_id,
      os.status_name,
      p.payment_name
    FROM orders o
    JOIN order_status os ON o.status_id = os.status_id
    JOIN payments p ON o.payment_id = p.payment_id
    WHERE o.order_id = ? AND o.cus_id = ?
    LIMIT 1
  `;

  // Get order items
  const itemsSql = `
    SELECT 
      od.order_detail_id,
      od.book_id,
      od.quantity,
      od.price,
      od.total_amount,
      b.book_title
    FROM order_details od
    JOIN books b ON od.book_id = b.book_id
    WHERE od.order_id = ?
  `;

  // Get order status history
  const historySql = `
    SELECT 
      osh.history_id,
      osh.created_at,
      osh.status_id,
      os.status_name
    FROM order_status_history osh
    JOIN order_status os ON osh.status_id = os.status_id
    WHERE osh.order_id = ?
    ORDER BY osh.created_at ASC
  `;

  try {
    const [header] = await db.query(headerSql, [order_id, cus_id]);
    if (header.length === 0) {
      throw new Error("Đơn hàng không tồn tại");
    }

    const [items] = await db.query(itemsSql, [order_id]);
    const [history] = await db.query(historySql, [order_id]);

    return {
      order: header[0],
      items,
      history,
    };
  } catch (error) {
    console.error("Get Order Details Error:", error.message);
    throw error;
  }
};

exports.cancelOrder = async ({ cus_id, order_id }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if order exists and belongs to customer and can be cancelled (status_id = 1)
    const [orderRows] = await connection.query(
      "SELECT status_id FROM orders WHERE order_id = ? AND cus_id = ? FOR UPDATE",
      [order_id, cus_id]
    );

    if (orderRows.length === 0) {
      throw new Error("Đơn hàng không tồn tại");
    }

    const currentStatus = Number(orderRows[0].status_id);
    if (currentStatus !== 1) {
      throw new Error("Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'");
    }

    // Update order status to cancelled (5)
    const updateSql = "UPDATE orders SET status_id = 5 WHERE order_id = ?";
    await connection.query(updateSql, [order_id]);

    // Add to history
    const historySql =
      "INSERT INTO order_status_history (order_id, status_id) VALUES (?, 5)";
    await connection.query(historySql, [order_id]);

    // Restore stock
    const [details] = await connection.query(
      "SELECT book_id, quantity FROM order_details WHERE order_id = ?",
      [order_id]
    );

    for (const d of details) {
      const bookId = d.book_id;
      const qty = d.quantity;
      if (bookId && qty > 0) {
        await connection.query(
          "UPDATE books SET stock_quantity = stock_quantity + ? WHERE book_id = ?",
          [qty, bookId]
        );
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.query("ROLLBACK");
    console.error("Cancel Order Error:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};
