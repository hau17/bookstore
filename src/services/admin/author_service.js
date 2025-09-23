const db = require('../../config/db.js')

exports.getAll = async () => {
  const sql = `
    SELECT 
      author_id,
      author_name,
      description
    FROM authors
    where status = '1'
  `;
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

exports.delete = async (id) => {
  const sql = 'UPDATE authors SET status = ? WHERE author_id = ?';
  try {
    const [result] = await db.query(sql, ['0', id]);
    return result.affectedRows;
  } catch (error) {
    console.error('Error deleting author:', error);
    throw new Error('Database delete failed: ' + error.message);
  }
};