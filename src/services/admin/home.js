const pool = require("../../config/db");

exports.authenticateAdmin = async (email, password) => {
  const sql = `
    SELECT user_id, email, password
    FROM users
    WHERE email = ?
    AND status = 1
    LIMIT 1
  `;

  try {
    const [rows] = await pool.query(sql, [email]);

    if (rows.length === 0) {
      throw new Error("Không tìm thấy admin");
    }

    const admin = rows[0];

    if (password !== admin.password) {
      throw new Error("Sai mật khẩu");
    }

    return admin;
  } catch (err) {
    console.error("Lỗi DB:", err.message);
    throw err;
  }
};
