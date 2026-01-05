const db = require("../../config/db");
const bcrypt = require("bcrypt");

exports.authenticateUser = async (email, password) => {
  const sql = `
    SELECT user_id, email, role, password, status
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [email]);

  if (rows.length === 0) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const user = rows[0];

  if (user.status !== 1) {
    throw new Error("Tài khoản đã bị khóa");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  return {
    user_id: user.user_id,
    email: user.email,
    role: user.role,
  };
};
