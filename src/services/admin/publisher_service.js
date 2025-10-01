const db = require('../../config/db.js');

exports.getAll = async (filter) => {
  let sql = `
    SELECT 
      publisher_id,
      publisher_name,
      address,
      phone_number,
      description,
      status
    FROM publishers
  `;

  if (filter === 'active') {
    sql += ' WHERE status = 1';
  } else if (filter === 'inactive') {
    sql += ' WHERE status = 0';
  } else {
    sql += ''; // No filter, get all
  }
  try {
      const [publishers] = await db.query(sql);
      return publishers;
  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.getById = async (id) => {
  const sql = `
    SELECT 
      publisher_id,
      publisher_name,
      address,
      phone_number,
      description,
      status
    FROM publishers
    WHERE publisher_id = ?
  `;
  try {
    const [publisher] = await db.query(sql, [id]);
    return publisher[0];
  } catch (error) {
    console.error('Error fetching publisher:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.add = async (publisher) => {
  const sql = `
    INSERT INTO publishers (publisher_name, address, phone_number, description)
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    publisher.publisher_name,
    publisher.address,
    publisher.phone_number,
    publisher.description
  ];
  try {
    const [result] = await db.query(sql, values);
    return result.insertId; // Trả về ID của nhà xuất bản mới
  } catch (error) {
    console.error('Error adding publisher:', error);
    throw new Error('Database insert failed: ' + error.message);
  }
};

exports.update = async (publisher) => {
  const sql = `
    UPDATE publishers
    SET publisher_name = ?, address = ?, phone_number = ?, description = ?, status = ?
    WHERE publisher_id = ?
  `;
  const values = [
    publisher.publisher_name,
    publisher.address,
    publisher.phone_number,
    publisher.description,
    1,
    publisher.publisher_id
  ];
  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows; // Số dòng bị ảnh hưởng
  } catch (error) {
    console.error('Error updating publisher:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};

// Cập nhật trạng thái (khóa/mở khóa)
exports.toggleStatus = async (id) => {
  const sql = `UPDATE publishers SET status = IF(status = 1, 0, 1) WHERE publisher_id = ?`;
  try {
    const [result] = await db.query(sql, [id]);
    return result.affectedRows; // Số dòng bị ảnh hưởng
  } catch (error) {
    console.error('Error toggling publisher status:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};