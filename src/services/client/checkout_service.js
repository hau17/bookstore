const db = require("../../config/db.js");
const orderService = require("../../services/client/order_service.js");
const productService = require("../../services/client/product_service.js");
const cartService = require("../../services/client/cart_service.js");
const session = require("express-session");

exports.checkoutItems = async (customerId, address, phoneNumber, paymentId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lấy danh sách sản phẩm trong giỏ hàng
    const { products, grandTotal } = await cartService.getAllProducts(
      customerId
    );

    if (!products || products.length === 0) {
      throw new Error("Giỏ hàng trống");
    }

    // 2. Kiểm tra tồn kho từng sản phẩm
    for (const item of products) {
      if (item.quantity > item.stock_quantity) {
        throw new Error(
          `Sản phẩm '${item.book_title}' không đủ hàng. Tồn kho chỉ còn ${item.stock_quantity}.`
        );
      }
    }

    // 3. Tính tổng số lượng
    const totalQuantity = products.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // 4. Tạo bản ghi ORDER
    const insertOrderSql = `
      INSERT INTO orders (cus_id, total_amount, total_quantity, address, phone_number, payment_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [orderResult] = await connection.execute(insertOrderSql, [
      customerId,
      grandTotal,
      totalQuantity,
      address,
      phoneNumber,
      paymentId,
    ]);

    const orderId = orderResult.insertId;

    // 5. Chèn chi tiết từng sản phẩm vào ORDER DETAILS
    const insertDetailSql = `
      INSERT INTO order_details (order_id, book_id, quantity, price, total_amount)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of products) {
      const lineTotal = item.selling_price * item.quantity;

      await connection.execute(insertDetailSql, [
        orderId,
        item.book_id,
        item.quantity,
        item.selling_price,
        lineTotal,
      ]);

      // 6. Trừ tồn kho
      const updateStockSql = `
        UPDATE books 
        SET stock_quantity = stock_quantity - ?
        WHERE book_id = ?
      `;
      await connection.execute(updateStockSql, [item.quantity, item.book_id]);
    }

    // 7. Xoá toàn bộ cart_items của user
    const deleteItemsSQL = `
      DELETE ci
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      WHERE c.cus_id = ?
    `;
    await connection.execute(deleteItemsSQL, [customerId]);

    //8. thêm order status history
    const insertStatusSql = `
      INSERT INTO order_status_history (order_id, status_id)
      VALUES (?, ?)
    `;
    await connection.execute(insertStatusSql, [orderId, 1]);
    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.buyNow = async (
  customerId,
  bookId,
  quantity = 1,
  address = null,
  phoneNumber = null,
  paymentId = 1
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // validate backend
    if (!customerId) throw new Error("Missing customerId");
    if (!bookId) throw new Error("Missing bookId");
    if (!address) throw new Error("Missing address");
    if (!phoneNumber) throw new Error("Missing phoneNumber");

    const book = await productService.getProductById(bookId);
    if (!book) throw new Error("Sản phẩm không tồn tại");
    if (quantity > book.stock_quantity) throw new Error("Không đủ hàng");

    const total_amount = (Number(book.selling_price) || 0) * Number(quantity);

    const Ordersql = `
      INSERT INTO orders (cus_id, total_amount, total_quantity, address, phone_number, payment_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Ensure every param is not undefined (use null if missing)
    const addressParam = address === "" ? null : address;
    const phoneParam = phoneNumber === "" ? null : phoneNumber;
    const paymentParam = Number.isFinite(Number(paymentId))
      ? Number(paymentId)
      : null;

    const [result] = await connection.execute(Ordersql, [
      customerId,
      total_amount,
      quantity,
      addressParam,
      phoneParam,
      paymentParam,
    ]);

    const orderId = result.insertId;

    const OrderDetailsql = `
      INSERT INTO order_details (order_id, book_id, quantity, price, total_amount)
      VALUES (?, ?, ?, ?, ?)
    `;
    const price = Number(book.selling_price) || 0;
    const lineTotal = price * Number(quantity);
    await connection.execute(OrderDetailsql, [
      orderId,
      bookId,
      quantity,
      price,
      lineTotal,
    ]);

    // update stock
    await connection.execute(
      `UPDATE books SET stock_quantity = stock_quantity - ? WHERE book_id = ?`,
      [quantity, bookId]
    );
    // thêm order status history
    const insertStatusSql = `
      INSERT INTO order_status_history (order_id, status_id)
      VALUES (?, ?)
    `;
    await connection.execute(insertStatusSql, [orderId, 1]);

    await connection.commit();

    return orderId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.generatePaymentQRCode = async ({ orderId, customerId }) => {
  const bankCode = "TPB";
  const accountNumber = "00000202511";
  const order = await orderService.getOrderById({
    order_id: orderId,
    cus_id: customerId,
  });
  if (!order) throw new Error("Order không tồn tại");

  // Chỉ tạo QR nếu payment là chuyển khoản
  if (order.payment_id !== 2) {
    return null;
  }

  const amount = order.total_amount;
  const addInfo = encodeURIComponent(`order-${orderId}`);

  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${addInfo}`;
};
