const pool = require("../../config/db");
const bcrypt = require("bcrypt");

exports.getAllUser = async ({ status, role } = {}) => {
  let sql = `
    SELECT user_id, email, fullname, role, status FROM users
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }
  if (role) {
    sql += ` AND role = ?`;
    params.push(role);
  }
  sql += ` ORDER BY user_id DESC`;
  const [rows] = await pool.query(sql, params);
  return rows;
};

exports.getUserById = async (userId) => {
  const sql = `
    SELECT user_id, email, fullname, role, status 
    FROM users 
    WHERE user_id = ?
  `;
  const [rows] = await pool.query(sql, [userId]);
  return rows[0];
};

exports.add = async ({ email, password, fullname, role }) => {
  // Check if email exists
  const [existingUsers] = await pool.query(
    "SELECT email FROM users WHERE email = ?",
    [email]
  );
  if (existingUsers.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (email, password, fullname, role, status)
    VALUES (?, ?, ?, ?, 1)
  `;
  const [result] = await pool.query(sql, [
    email,
    hashedPassword,
    fullname,
    role,
  ]);
  return result;
};

exports.update = async ({ userId, email, password, fullname, role }) => {
  // Check if email exists for other users
  const [existingUsers] = await pool.query(
    "SELECT email FROM users WHERE email = ? AND user_id != ?",
    [email, userId]
  );
  if (existingUsers.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  let sql = `
    UPDATE users 
    SET email = ?, fullname = ?, role = ?
  `;
  const params = [email, fullname, role];

  // Only update password if provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    sql += `, password = ?`;
    params.push(hashedPassword);
  }

  sql += ` WHERE user_id = ?`;
  params.push(userId);

  const [result] = await pool.query(sql, params);
  return result;
};

exports.toggleStatus = async (userId) => {
  const sql = `
    UPDATE users 
    SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END
    WHERE user_id = ?
  `;
  const [result] = await pool.query(sql, [userId]);
  return result;
};
