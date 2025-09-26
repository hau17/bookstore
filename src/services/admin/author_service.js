const db = require('../../config/db.js')

exports.getAll = async (filter) => {
  let sql = `
    SELECT 
      author_id,
      author_name,
      description,
      status
    FROM authors
  `;
  if (filter === 'active') {
    sql += " WHERE status = '1'";
  } else if (filter === 'inactive') {
    sql += " WHERE status = '0'";
  }
  try {
    const [authors] = await db.query(sql);
    return authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.getById = async (id) => {
  const sql = `
    SELECT 
      author_id,
      author_name,
      description
    FROM authors
    WHERE author_id = ?
  `;
  try {
    const [author] = await db.query(sql, [id]);
    return author[0];
  } catch (error) {
    console.error('Error fetching author:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.add = async (author) => {
  const sql = 'INSERT INTO authors (author_name, description) VALUES (?, ?)';
  const values = [author.author_name, author.description];
  try {
    const [result] = await db.query(sql, values);
    return result.insertId; // Trả về ID của tác giả mới được thêm
  } catch (error) {
    console.error('Error adding author:', error);
    throw new Error('Database insert failed: ' + error.message);
  }
};

exports.update = async (author) => {
  const sql = 'UPDATE authors SET author_name = ?, description = ? WHERE author_id = ?';
  const values = [author.author_name, author.description, author.author_id];
  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows; // Trả về số lượng bản ghi đã cập nhật
  } catch (error) {
    console.error('Error updating author:', error);
    throw new Error('Database update failed: ' + error.message);
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
    console.error('Error toggling author status:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};