const db = require("../../config/db.js");

exports.addImport = async ({ publisher_id, books }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into imports table
    const [importResult] = await connection.query(
      "INSERT INTO imports (publisher_id) VALUES (?)",
      [publisher_id]
    );
    // Lỗi 1: Cần dùng insertId để lấy ID của hàng vừa tạo
    const import_id = importResult.insertId;

    // 2. Insert into import_details table & Update books table
    for (const book of books) {
      // Lỗi 2: Dữ liệu nhận vào có book ID là 'id' chứ không phải 'book_id'
      const bookId = book.book_id;
      const quantity = parseInt(book.quantity); // Đảm bảo là số
      const importPrice = parseFloat(book.import_price); // Đảm bảo là số

      // 2a. Insert into import_details (Sử dụng bookId và import_id đã sửa)
      await connection.query(
        "INSERT INTO import_details (import_id, book_id, quantity, import_price) VALUES (?, ?, ?, ?)",
        [import_id, bookId, quantity, importPrice] // Đã đổi price -> import_price
      );

      // 2b. Lấy thông tin hiện tại của sách (cần thiết cho tính toán giá trung bình mới)
      const [[currentBook]] = await connection.query(
        "SELECT stock_quantity, avg_import_price, profit_percentage FROM books WHERE book_id = ? FOR UPDATE",
        [bookId]
      );

      if (!currentBook) {
        throw new Error(`Book with ID ${bookId} not found.`);
      }

      const oldQuantity = Number(currentBook.stock_quantity) || 0;
      const oldAvgPrice = Number(currentBook.avg_import_price) || 0;

      // Tính toán giá trung bình mới (New Weighted Average Price)
      let newAvgImportPrice;
      const totalQty = oldQuantity + quantity;
      if (totalQty > 0) {
        newAvgImportPrice =
          (oldAvgPrice * oldQuantity + importPrice * quantity) / totalQty;
      } else {
        // nếu trước đó chưa có lượng (0), thì lấy giá nhập làm giá trung bình
        newAvgImportPrice = importPrice;
      }

      // đảm bảo số hợp lệ
      if (!isFinite(newAvgImportPrice) || Number.isNaN(newAvgImportPrice)) {
        newAvgImportPrice = importPrice;
      }

      // 2c. Update books table: chỉ cập nhật avg_import_price và stock_quantity
      await connection.query(
        `UPDATE books
                 SET 
                    avg_import_price = ?,
                    stock_quantity = stock_quantity + ?
                 WHERE book_id = ?`,
        [newAvgImportPrice, quantity, bookId]
      );
    }

    await connection.commit();
    return import_id;
  } catch (error) {
    await connection.rollback();
    console.error("Error adding import:", error);
    throw new Error("Database transaction failed: " + error.message);
  } finally {
    connection.release();
  }
};

// Get all imports (summary for list view)
exports.getAllImports = async () => {
  const sql = `
    SELECT i.import_id, i.publisher_id, p.publisher_name, i.created_at,
      SUM(d.quantity) AS total_quantity,
      SUM(d.quantity * d.import_price) AS total_cost
    FROM imports i
    JOIN publishers p ON p.publisher_id = i.publisher_id
    JOIN import_details d ON d.import_id = i.import_id
    GROUP BY i.import_id
    ORDER BY i.import_id DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};

// Get import details by import_id
exports.getImportDetails = async (importId) => {
  const sqlHeader = `
    SELECT i.import_id, i.publisher_id, p.publisher_name, i.created_at
    FROM imports i
    JOIN publishers p ON p.publisher_id = i.publisher_id
    WHERE i.import_id = ?
  `;
  const [headers] = await db.query(sqlHeader, [importId]);
  if (!headers || headers.length === 0) return null;
  const header = headers[0];

  const sqlDetails = `
    SELECT d.book_id, b.book_title, d.quantity, d.import_price,
      (d.quantity * d.import_price) AS line_total
    FROM import_details d
    JOIN books b ON b.book_id = d.book_id
    WHERE d.import_id = ?
  `;
  const [details] = await db.query(sqlDetails, [importId]);

  // compute totals
  const total_quantity = details.reduce((s, r) => s + Number(r.quantity), 0);
  const total_cost = details.reduce((s, r) => s + Number(r.line_total || 0), 0);

  return {
    header,
    details,
    total_quantity,
    total_cost,
  };
};
