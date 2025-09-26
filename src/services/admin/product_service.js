const e = require('express');
const db = require('../../config/db.js')

exports.getAll = async (status) => {
  let sql = `
    SELECT 
      b.book_id,
      b.book_title,
      b.price,
      b.discount_percentage,
      b.stock_quantity,
      b.description,
      b.image_path,
      b.created_date,
      b.status,
      c.category_name,
      a.author_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
  `;
  if (status !== undefined) {
    sql += ' WHERE b.status = ?';
  }
  try {
    const [products] = status !== undefined ? await db.query(sql, [status]) : await db.query(sql);
      return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.getProductById = async (id) => {
  const sql = `
    SELECT 
      b.book_id,
      b.book_title,
      b.price,
      b.discount_percentage,
      b.stock_quantity,
      b.description,
      b.image_path,
      b.created_date,
      b.status,
      c.category_name,
      a.author_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.book_id = ? AND b.status = '1'
  `;
  try {
    const [product] = await db.query(sql, [id]);
    return product[0];
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Database fetch failed: ' + error.message);
  }
};

exports.add = async(product) => {
  const sql = 'INSERT INTO books (book_title, category_id, author_id, publisher_id,discount_percentage,description,image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [product.book_title, product.category_id, product.author_id, product.publisher_id,
    product.discount_percentage,product.description,product.image_path];
  try {
    const [result] = await db.query(sql, values);
    return result.insertId; // Trả về ID của sản phẩm mới được thêm
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Database insert failed: ' + error.message);
  }
}

exports.update = async(product) => {
  const sql = 'UPDATE books SET book_title = ?, category_id = ?, author_id = ?, publisher_id = ?, discount_percentage = ?, description = ?, image_path = ? WHERE book_id = ?';
  const values = [product.book_title, product.category_id, product.author_id, product.publisher_id,
    product.discount_percentage, product.description, product.image_path, product.book_id];
  try {
    const [result] = await db.query(sql, values);
    return result.affectedRows; // Trả về số lượng bản ghi đã cập nhật
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Database update failed: ' + error.message);
  }
}

// Cập nhật trạng thái (khóa/mở khóa)
exports.toggleStatus = async(id) => {
  const sql = 'update books set status = if(status = 1, 0, 1) WHERE book_id = ?';
  try {
    const [result] = await db.query(sql, [id]);
    return result; 
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw new Error('Database update failed: ' + error.message);
  }
}

exports.delete = async(id) => {
  const sql = 'update books set status = ? WHERE book_id = ?';
  try {
    const [result] = await db.query(sql, ['0',id]);
    return result; 
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Database delete failed: ' + error.message);
  }
}