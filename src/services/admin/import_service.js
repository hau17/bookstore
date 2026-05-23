const db = require("../../config/db.js");

// Tạo phiếu nhập ở trạng thái Draft (status=0). KHÔNG cộng kho.
exports.addImport = async ({ publisher_id, books, created_by }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [importResult] = await connection.query(
      "INSERT INTO imports (publisher_id, status, created_by) VALUES (?, 0, ?)",
      [publisher_id, created_by]
    );
    const import_id = importResult.insertId;

    for (const book of books) {
      const bookId = book.book_id;
      const quantity = parseInt(book.quantity);
      const importPrice = parseFloat(book.import_price);

      await connection.query(
        "INSERT INTO import_details (import_id, book_id, quantity, import_price) VALUES (?, ?, ?, ?)",
        [import_id, bookId, quantity, importPrice]
      );
    }

    await connection.commit();
    return import_id;
  } catch (error) {
    await connection.rollback();
    console.error("Error adding import:", error);
    throw new Error("Lỗi khi tạo phiếu nhập: " + error.message);
  } finally {
    connection.release();
  }
};

// Staff: chuyển Draft (0) → Pending (1)
exports.submitImport = async (importId, userId) => {
  const [[imp]] = await db.query(
    "SELECT status, created_by FROM imports WHERE import_id = ?",
    [importId]
  );
  if (!imp) throw new Error("Phiếu nhập không tồn tại");
  if (imp.status !== 0) throw new Error("Chỉ có thể gửi duyệt phiếu ở trạng thái Nháp");
  if (imp.created_by !== userId) throw new Error("Bạn không có quyền gửi duyệt phiếu này");

  await db.query(
    "UPDATE imports SET status = 1, reject_reason = NULL WHERE import_id = ?",
    [importId]
  );
};

// Staff: hủy gửi, Pending (1) → Draft (0)
exports.recallImport = async (importId, userId) => {
  const [[imp]] = await db.query(
    "SELECT status, created_by FROM imports WHERE import_id = ?",
    [importId]
  );
  if (!imp) throw new Error("Phiếu nhập không tồn tại");
  if (imp.status !== 1) throw new Error("Chỉ có thể hủy gửi phiếu ở trạng thái Chờ duyệt");
  if (imp.created_by !== userId) throw new Error("Bạn không có quyền hủy gửi phiếu này");

  await db.query(
    "UPDATE imports SET status = 0 WHERE import_id = ?",
    [importId]
  );
};

// Manager/Admin: từ chối, Pending (1) → Draft (0) + lưu lý do
exports.rejectImport = async (importId, reason) => {
  if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do từ chối");

  const [[imp]] = await db.query(
    "SELECT status FROM imports WHERE import_id = ?",
    [importId]
  );
  if (!imp) throw new Error("Phiếu nhập không tồn tại");
  if (imp.status !== 1) throw new Error("Chỉ có thể từ chối phiếu ở trạng thái Chờ duyệt");

  await db.query(
    "UPDATE imports SET status = 0, reject_reason = ? WHERE import_id = ?",
    [reason.trim(), importId]
  );
};

// Manager/Admin: duyệt Pending (1) → Approved (2). Transaction + FOR UPDATE.
// CHỈ ở bước này mới cộng kho và tính Weighted Average Price.
exports.approveImport = async (importId, managerId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[imp]] = await connection.query(
      "SELECT status FROM imports WHERE import_id = ? FOR UPDATE",
      [importId]
    );
    if (!imp) throw new Error("Phiếu nhập không tồn tại");
    if (imp.status !== 1) throw new Error("Chỉ có thể duyệt phiếu ở trạng thái Chờ duyệt");

    const [details] = await connection.query(
      "SELECT book_id, quantity, import_price FROM import_details WHERE import_id = ?",
      [importId]
    );

    for (const detail of details) {
      const qty = Number(detail.quantity);
      const importPrice = Number(detail.import_price);

      const [[currentBook]] = await connection.query(
        "SELECT stock_quantity, avg_import_price FROM books WHERE book_id = ? FOR UPDATE",
        [detail.book_id]
      );
      if (!currentBook) throw new Error(`Sách ID ${detail.book_id} không tồn tại`);

      const oldQty = Number(currentBook.stock_quantity) || 0;
      const oldAvg = Number(currentBook.avg_import_price) || 0;
      const totalQty = oldQty + qty;

      let newAvg = totalQty > 0
        ? (oldAvg * oldQty + importPrice * qty) / totalQty
        : importPrice;

      if (!isFinite(newAvg) || Number.isNaN(newAvg)) newAvg = importPrice;

      await connection.query(
        "UPDATE books SET stock_quantity = stock_quantity + ?, avg_import_price = ? WHERE book_id = ?",
        [qty, newAvg, detail.book_id]
      );
    }

    await connection.query(
      "UPDATE imports SET status = 2, approved_by = ?, approved_at = NOW() WHERE import_id = ?",
      [managerId, importId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error approving import:", error);
    throw new Error(error.message || "Lỗi khi duyệt phiếu nhập");
  } finally {
    connection.release();
  }
};

// Staff: xóa phiếu. Chỉ được khi status=0. Dùng Transaction để tránh orphan records.
exports.deleteImport = async (importId, userId, role) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Lock record để kiểm tra status trước khi xóa
    const [[imp]] = await connection.query(
      "SELECT status, created_by FROM imports WHERE import_id = ? FOR UPDATE",
      [importId]
    );
    if (!imp) throw new Error("Phiếu nhập không tồn tại");
    if (imp.status !== 0) throw new Error("Chỉ có thể xóa phiếu ở trạng thái Nháp");
    if (role === "staff" && imp.created_by !== userId) {
      throw new Error("Bạn không có quyền xóa phiếu này");
    }

    // Xóa chi tiết trước (FK ON DELETE SET NULL nên phải xóa tường minh)
    await connection.query(
      "DELETE FROM import_details WHERE import_id = ?",
      [importId]
    );

    // Sau đó mới xóa phiếu gốc
    await connection.query(
      "DELETE FROM imports WHERE import_id = ?",
      [importId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting import:", error);
    throw new Error(error.message || "Lỗi khi xóa phiếu nhập");
  } finally {
    connection.release();
  }
};

// Lấy danh sách phiếu. Staff chỉ thấy của mình; Manager/Admin thấy tất cả.
exports.getAllImports = async ({ statusFilter, userId, role }) => {
  let sql = `
    SELECT i.import_id, i.publisher_id, p.publisher_name, i.created_at, i.status,
      i.created_by, u1.fullname AS created_by_name,
      i.approved_by, u2.fullname AS approved_by_name,
      COALESCE(SUM(d.quantity), 0) AS total_quantity,
      COALESCE(SUM(d.quantity * d.import_price), 0) AS total_cost
    FROM imports i
    JOIN publishers p ON p.publisher_id = i.publisher_id
    LEFT JOIN import_details d ON d.import_id = i.import_id
    LEFT JOIN users u1 ON u1.user_id = i.created_by
    LEFT JOIN users u2 ON u2.user_id = i.approved_by
  `;
  const conditions = [];
  const params = [];

  if (role === "staff") {
    conditions.push("i.created_by = ?");
    params.push(userId);
  }
  if (statusFilter !== null && statusFilter !== undefined) {
    conditions.push("i.status = ?");
    params.push(statusFilter);
  }
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " GROUP BY i.import_id ORDER BY i.import_id DESC";

  const [rows] = await db.query(sql, params);
  return rows;
};

// Lấy chi tiết 1 phiếu (header + items). Bao gồm status, reject_reason, tên người tạo/duyệt.
exports.getImportDetails = async (importId) => {
  const [headers] = await db.query(
    `SELECT i.import_id, i.publisher_id, p.publisher_name, i.created_at,
      i.status, i.reject_reason, i.approved_at,
      i.created_by, u1.fullname AS created_by_name,
      i.approved_by, u2.fullname AS approved_by_name
    FROM imports i
    JOIN publishers p ON p.publisher_id = i.publisher_id
    LEFT JOIN users u1 ON u1.user_id = i.created_by
    LEFT JOIN users u2 ON u2.user_id = i.approved_by
    WHERE i.import_id = ?`,
    [importId]
  );
  if (!headers || headers.length === 0) return null;
  const header = headers[0];

  const [details] = await db.query(
    `SELECT d.book_id, b.book_title, d.quantity, d.import_price,
      (d.quantity * d.import_price) AS line_total
    FROM import_details d
    JOIN books b ON b.book_id = d.book_id
    WHERE d.import_id = ?`,
    [importId]
  );

  const total_quantity = details.reduce((s, r) => s + Number(r.quantity), 0);
  const total_cost = details.reduce((s, r) => s + Number(r.line_total || 0), 0);

  return { header, details, total_quantity, total_cost };
};

// Staff: lấy dữ liệu cho form edit. Kiểm tra quyền trước khi trả về.
// publisherOverride: nếu có, tải sách từ NXB mới (clean slate, không pre-select).
exports.getImportForEdit = async (importId, userId, publisherOverride = null) => {
  const [[imp]] = await db.query(
    `SELECT i.import_id, i.publisher_id, p.publisher_name, i.status, i.created_by
     FROM imports i
     JOIN publishers p ON p.publisher_id = i.publisher_id
     WHERE i.import_id = ?`,
    [importId]
  );
  if (!imp) throw new Error("Phiếu nhập không tồn tại");
  if (imp.status !== 0) throw new Error("Chỉ có thể chỉnh sửa phiếu ở trạng thái Nháp");
  if (imp.created_by !== userId) throw new Error("Bạn không có quyền chỉnh sửa phiếu này");

  const activePublisherId = publisherOverride ? parseInt(publisherOverride) : imp.publisher_id;

  // Chỉ tải pre-selected khi KHÔNG override publisher (tức là xem NXB gốc)
  const existingMap = {};
  if (!publisherOverride) {
    const [existingDetails] = await db.query(
      "SELECT book_id, quantity, import_price FROM import_details WHERE import_id = ?",
      [importId]
    );
    for (const d of existingDetails) {
      existingMap[d.book_id] = {
        quantity: d.quantity,
        import_price: Number(d.import_price),
      };
    }
  }

  const [allBooks] = await db.query(
    `SELECT b.book_id, b.book_title, b.avg_import_price, b.stock_quantity, a.author_name
     FROM books b
     LEFT JOIN authors a ON a.author_id = b.author_id
     WHERE b.publisher_id = ?
     ORDER BY b.book_title`,
    [activePublisherId]
  );

  const booksWithState = allBooks.map((b) => ({
    book_id: b.book_id,
    book_title: b.book_title,
    author_name: b.author_name,
    avg_import_price: b.avg_import_price,
    stock_quantity: b.stock_quantity,
    checked: !!existingMap[b.book_id],
    prefill_qty: existingMap[b.book_id] ? existingMap[b.book_id].quantity : "",
    prefill_price: existingMap[b.book_id] ? existingMap[b.book_id].import_price : "",
  }));

  return { importHeader: imp, books: booksWithState, activePublisherId };
};

// Staff: cập nhật phiếu nháp. Replace Strategy (DELETE + INSERT) trong Transaction.
// publisher_id: NXB mới (có thể khác NXB cũ). Validate sách phải thuộc NXB này.
exports.updateImport = async (importId, userId, books, publisher_id) => {
  if (!publisher_id) throw new Error("Vui lòng chọn nhà xuất bản");

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Bước 1: Validate DB (Phiếu có tồn tại không? status có phải 0 không? created_by có đúng user hiện tại không?)
    const [[imp]] = await connection.query(
      "SELECT status, created_by FROM imports WHERE import_id = ? FOR UPDATE",
      [importId]
    );
    if (!imp) throw new Error("Phiếu nhập không tồn tại");
    if (imp.status !== 0) throw new Error("Chỉ có thể chỉnh sửa phiếu ở trạng thái Nháp");
    if (imp.created_by !== userId) throw new Error("Bạn không có quyền chỉnh sửa phiếu này");

    // Validate sách thuộc nhà xuất bản
    for (const book of books) {
      const [[bookRow]] = await connection.query(
        "SELECT publisher_id FROM books WHERE book_id = ?",
        [book.book_id]
      );
      if (!bookRow) throw new Error(`Sách ID ${book.book_id} không tồn tại`);
      if (bookRow.publisher_id !== parseInt(publisher_id, 10)) {
        throw new Error(`Sách ID ${book.book_id} không thuộc nhà xuất bản đã chọn`);
      }
    }

    // Bước 2: DELETE FROM import_details WHERE import_id = ?
    await connection.query("DELETE FROM import_details WHERE import_id = ?", [importId]);

    // Bước 3: UPDATE imports SET publisher_id = ? WHERE import_id = ?
    await connection.query(
      "UPDATE imports SET publisher_id = ? WHERE import_id = ?",
      [parseInt(publisher_id, 10), importId]
    );

    // Bước 4: Chạy vòng lặp để INSERT INTO import_details với danh sách sách MỚI ĐÃ ĐƯỢC LỌC SẠCH
    for (const book of books) {
      await connection.query(
        "INSERT INTO import_details (import_id, book_id, quantity, import_price) VALUES (?, ?, ?, ?)",
        [importId, book.book_id, book.quantity, book.import_price]
      );
    }

    // Bước 5: Commit
    await connection.commit();
  } catch (error) {
    // Bất kỳ bước nào lỗi đều rollback và ném lỗi rõ ràng lên Controller
    await connection.rollback();
    console.error("Error updating import:", error);
    throw new Error(error.message || "Lỗi khi cập nhật phiếu nhập");
  } finally {
    connection.release();
  }
};
