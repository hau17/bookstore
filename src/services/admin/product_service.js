const db = require("../../config/db.js");

exports.getAll = async ({ status, publisherId } = {}) => {
  let sql = `
    SELECT 
      b.book_id,
      b.book_title,
      b.category_id,
      b.author_id,
      b.publisher_id,
      b.discount_percentage,
      b.profit_percentage,
      b.avg_import_price,
      b.stock_quantity,
      b.description,
      b.image_path,
      b.created_at,
      b.status,
      c.category_name,
      a.author_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE 1=1
  `;

  const params = [];

  if (status !== undefined) {
    sql += " AND b.status = ?";
    params.push(status);
  }

  if (publisherId !== undefined) {
    sql += " AND b.publisher_id = ?";
    params.push(publisherId);
  }

  try {
    const [products] = await db.query(sql, params);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Database fetch failed: " + error.message);
  }
};

exports.getProductById = async (id) => {
  const sql = `
    SELECT 
      b.book_id,
      b.book_title,
      b.category_id,
      b.author_id,
      b.publisher_id,
      b.discount_percentage,
      b.profit_percentage,
      b.avg_import_price,
      b.stock_quantity,
      b.description,
      b.image_path,
      b.created_at,
      b.status,
      c.category_name,
      a.author_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.book_id = ? 
  `;
  try {
    const [product] = await db.query(sql, [id]);
    return product[0];
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Database fetch failed: " + error.message);
  }
};

exports.add = async (product) => {
  // Ensure we store discount_percentage and avg_import_price (defaults when not provided)
  const sql = `
    INSERT INTO books (
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      profit_percentage,
      avg_import_price,
      stock_quantity,
      description,
      image_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    product.book_title,
    product.category_id,
    product.author_id,
    product.publisher_id,
    Number(product.discount_percentage) || 0,
    Number(product.profit_percentage) || 0,
    Number(product.avg_import_price) || 0,
    Number(product.stock_quantity) || 0,
    product.description || null,
    product.image_path || null,
  ];

  try {
    const [result] = await db.query(sql, values);
    return result.insertId; // Trả về ID của sản phẩm mới được thêm
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Database insert failed: " + error.message);
  }
};

exports.update = async (product) => {
  // Update product including discount and avg import price / stock if provided
  const sql = `
    UPDATE books
    SET
      book_title = ?,
      category_id = ?,
      author_id = ?,
      publisher_id = ?,
      discount_percentage = ?,
      profit_percentage = ?,
      description = ?,
      image_path = ?
    WHERE book_id = ?`;

  const values = [
    product.book_title,
    product.category_id,
    product.author_id,
    product.publisher_id,
    Number(product.discount_percentage) || 0,
    Number(product.profit_percentage) || 0,
    product.description || null,
    product.image_path || null,
    product.book_id,
  ];
  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows; // Trả về số lượng bản ghi đã cập nhật
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Database update failed: " + error.message);
  }
};

// Cập nhật trạng thái (khóa/mở khóa)
exports.toggleStatus = async (id) => {
  const sql =
    "update books set status = if(status = 1, 0, 1) WHERE book_id = ?";
  try {
    const [result] = await db.query(sql, [id]);
    return result;
  } catch (error) {
    console.error("Error toggling product status:", error);
    throw new Error("Database update failed: " + error.message);
  }
};

exports.delete = async (id) => {
  const sql = "update books set status = ? WHERE book_id = ?";
  try {
    const [result] = await db.query(sql, ["0", id]);
    return result;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Database delete failed: " + error.message);
  }
};

exports.addImport = async ({ book_id, quantity, import_price }) => {
  // Compute new average import price and increment stock
  const sql = `
    UPDATE books
    SET
      avg_import_price = (COALESCE(avg_import_price,0) * stock_quantity + ? * ?) / (stock_quantity + ?),
      stock_quantity = stock_quantity + ?
    WHERE book_id = ?`;

  // params: import_price, quantity, quantity (for denom), quantity (increase), book_id
  const values = [import_price, quantity, quantity, quantity, book_id];

  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows;
  } catch (error) {
    console.error("Error adding import:", error);
    throw new Error("Database update failed: " + error.message);
  }
};
