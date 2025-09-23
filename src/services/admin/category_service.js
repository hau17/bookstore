const db = require('../../config/db.js')

exports.getAll = async() => {
  const sql = 'SELECT * FROM categories';
  const [rows] = await db.query(sql);
  return rows;
}
exports.getCategoryById = async(id) => {
    const sql = 'SELECT * FROM categories WHERE category_id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0]; // Trả về đối tượng category hoặc undefined nếu không tìm thấy
    }