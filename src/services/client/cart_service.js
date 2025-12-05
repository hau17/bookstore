const db = require("../../config/db.js");
const calculatePrices = (books) => {
  books.forEach((book) => {
    const avg = Number(book.avg_import_price || 0);
    const profit = Number(book.profit_percentage || 0);
    const discount = Number(book.discount_percentage || 0);
    const quantity = Number(book.quantity || 0);
    // Giá gốc trước khi giảm
    book.original_price = Math.round(avg * (1 + profit / 100));

    // Giá bán sau khi giảm
    book.selling_price = Math.round(book.original_price * (1 - discount / 100));
    // Tổng tiền cho số lượng
    book.itemTotal = book.selling_price * quantity;
  });
};

exports.getAllProducts = async (cus_id) => {
  const sql = `
      SELECT 
        b.book_id,
        b.book_title,
        b.avg_import_price,
        b.discount_percentage,
        b.profit_percentage,
        b.stock_quantity,
        b.image_path,
        ci.quantity
      FROM carts c 
      JOIN cart_items ci ON c.cart_id = ci.cart_id
      JOIN books b ON ci.book_id = b.book_id
      WHERE c.cus_id = ?
    `;
  try {
    const [products] = await db.query(sql, [cus_id]);
    calculatePrices(products);
    // Tính tổng tiền tất cả các mục trong giỏ hàng
    const grandTotal = products.reduce((sum, book) => sum + book.itemTotal, 0);
    return { products, grandTotal };
  } catch (error) {
    console.error("Error fetching cart products:", error);
    throw new Error("Database fetch failed: " + error.message);
  }
};

exports.addToCart = async (cus_id, book_id) => {
  try {
    // Get cart_id
    const [cartResult] = await db.query(
      "SELECT cart_id FROM carts WHERE cus_id = ?",
      [cus_id]
    );

    if (!cartResult.length) {
      throw new Error("Giỏ hàng không tồn tại");
    }

    const cart_id = cartResult[0].cart_id;

    // Check if item already exists in cart
    const [existingItem] = await db.query(
      "SELECT quantity FROM cart_items WHERE cart_id = ? AND book_id = ?",
      [cart_id, book_id]
    );

    if (existingItem.length > 0) {
      // Item already exists - keep quantity as 1 (không thay đổi)
      return true;
    } else {
      // Item doesn't exist - insert with quantity 1
      const [result] = await db.query(
        "INSERT INTO cart_items (cart_id, book_id, quantity) VALUES (?, ?, 1)",
        [cart_id, book_id]
      );
      return result.affectedRows > 0;
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    throw new Error(error.message || "Lỗi khi thêm vào giỏ hàng");
  }
};

exports.updateCartItem = async (cus_id, book_id, action) => {
  try {
    // Lấy thông tin hiện tại
    const sqlGet = `
      SELECT ci.quantity, b.stock_quantity
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      JOIN books b ON ci.book_id = b.book_id
      WHERE c.cus_id = ? AND ci.book_id = ?
    `;
    const [[item]] = await db.query(sqlGet, [cus_id, book_id]);

    if (!item) {
      return { success: false, message: "Không tìm thấy sản phẩm" };
    }

    let newQty = item.quantity;

    // Xử lý tăng / giảm
    if (action === "increase") {
      newQty++;
      if (newQty > item.stock_quantity) {
        return {
          success: false,
          message: `Chỉ còn ${item.stock_quantity} sản phẩm trong kho`,
        };
      }
    }

    if (action === "decrease") {
      newQty--;
      if (newQty < 1) {
        return {
          success: false,
          message: "Số lượng không thể nhỏ hơn 1",
        };
      }
    }

    // Cập nhật SQL
    const sqlUpdate = `
      UPDATE cart_items SET quantity = ?
      WHERE cart_id = (SELECT cart_id FROM carts WHERE cus_id = ?)
      AND book_id = ?
    `;
    await db.query(sqlUpdate, [newQty, cus_id, book_id]);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

exports.removeCartItem = async (cus_id, book_id) => {
  const sql = `
    DELETE ci
    FROM cart_items AS ci
    JOIN carts AS c ON ci.cart_id = c.cart_id
    WHERE c.cus_id = ? AND ci.book_id = ?
  `;

  try {
    const [result] = await db.query(sql, [cus_id, book_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error removing product from cart:", error);
    throw new Error("Database operation failed: " + error.message);
  }
};
