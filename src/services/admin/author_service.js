const db = require("../../config/db.js");

exports.getAll = async ({ status }) => {
  let sql = `
    SELECT 
      author_id,
      author_name,
      email,
      description,
      status
    FROM authors
  `;
  const param = [];
  if (status === "1" || status === "0") {
    sql += ` WHERE status = ? `;
    param.push(status);
  }
  try {
    const [authors] = await db.query(sql, param);
    return authors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw new Error("Database fetch failed: " + error.message);
  }
};

exports.getById = async (id) => {
  const sql = `
    SELECT 
      author_id,
      author_name,
      email,
      description
    FROM authors
    WHERE author_id = ?
  `;
  try {
    const [author] = await db.query(sql, [id]);
    return author[0];
  } catch (error) {
    console.error("Error fetching author:", error);
    throw new Error("Database fetch failed: " + error.message);
  }
};

exports.add = async (author) => {
  // Kiểm tra email đã tồn tại
  const [existing] = await db.query("SELECT 1 FROM authors WHERE email = ?", [
    author.email,
  ]);
  if (existing.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  const sql =
    "INSERT INTO authors (author_name, email, description) VALUES (?, ?, ?)";
  const values = [author.author_name, author.email, author.description];
  try {
    const [result] = await db.query(sql, values);
    return result.insertId; // Trả về ID của tác giả mới được thêm
  } catch (error) {
    console.error("Error adding author:", error);
    throw new Error("Database insert failed: " + error.message);
  }
};

exports.update = async (author) => {
  // Kiểm tra email (không trùng với các tác giả khác)
  const [existing] = await db.query(
    "SELECT 1 FROM authors WHERE email = ? AND author_id != ?",
    [author.email, author.author_id]
  );
  if (existing.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  const sql =
    "UPDATE authors SET author_name = ?, email = ?, description = ? WHERE author_id = ?";
  const values = [
    author.author_name,
    author.email,
    author.description,
    author.author_id,
  ];
  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows; // Trả về số lượng bản ghi đã cập nhật
  } catch (error) {
    console.error("Error updating author:", error);
    throw new Error("Database update failed: " + error.message);
  }
};

exports.toggleStatus = async (id) => {
  const sql = `
    UPDATE authors
    SET status = CASE WHEN status = '1' THEN '0' ELSE '1' END
    WHERE author_id = ?
  `;
  try {
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  } catch (error) {
    console.error("Error toggling author status:", error);
    throw new Error("Database update failed: " + error.message);
  }
};
