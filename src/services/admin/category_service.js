const db = require('../../config/db.js');

exports.getAll = async (filter) => {
  let sql = `
    SELECT 
      category_id,
      category_name,
      description,
      status
    FROM categories
  `;

  if (filter === 'active') {
    sql += ' WHERE status = 1';
  } else if (filter === 'inactive') {
    sql += ' WHERE status = 0';
  }

  try {
    const [categories] = await db.query(sql);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.getById = async (id) => {
  const sql = `
    SELECT 
      category_id,
      category_name,
      description,
      status
    FROM categories
    WHERE category_id = ?
  `;
  try {
    const [category] = await db.query(sql, [id]);
    return category[0];
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.add = async (category) => {
  const sql = `
    INSERT INTO categories (category_name, description)
    VALUES (?, ?)
  `;
  const values = [category.category_name, category.description];
  try {
    const [result] = await db.query(sql, values);
    return result.insertId;
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error('Database insert failed: ' + error.message);
  }
};

exports.update = async (category) => {
  const sql = `
    UPDATE categories
    SET category_name = ?, description = ?
    WHERE category_id = ?
  `;
  const values = [
    category.category_name,
    category.description,
    category.category_id
  ];
  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};

exports.toggleStatus = async (id) => {
  const sql = `UPDATE categories SET status = IF(status = 1, 0, 1) WHERE category_id = ?`;
  try {
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  } catch (error) {
    console.error('Error toggling category status:', error);
    throw new Error('Database update failed: ' + error.message);
  }
};