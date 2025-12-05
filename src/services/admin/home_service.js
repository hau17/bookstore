const pool = require("../../config/db");

exports.authenticateUser = async (email, password) => {
  const sql = `
    SELECT user_id, email, role , password
    FROM users
    WHERE email = ?
    AND status = 1
    LIMIT 1
  `;

  try {
    const [rows] = await pool.query(sql, [email]);

    if (rows.length === 0) {
      throw new Error("Không tìm thấy tài khoản");
    }

    const user = rows[0];

    if (password !== user.password) {
      throw new Error("Sai mật khẩu");
    }

    return user;
  } catch (err) {
    console.error("Lỗi DB:", err.message);
    throw err;
  }
};

//role gồm có admin, manager, staff
//các quyền hạn tương ứng sẽ được quy định trong các service khác nhau
// thêm
// exports.addUser
