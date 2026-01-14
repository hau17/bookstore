const db = require("../../config/db.js");
const bcrypt = require("bcryptjs");

exports.getAccountInfo = async (userId) => {
  const sql = `SELECT user_id, email, fullname, role, created_at, status 
      FROM users 
      WHERE user_id = ? AND status = '1'`;
  try {
    const [result] = await db.query(sql, [userId]);
    return result[0];
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản:", error);
    throw error;
  }
};

exports.updateAccountInfo = async ({ userId, email, fullname }) => {
  const sql = `UPDATE users 
      SET email = ?, fullname = ? 
      WHERE user_id = ?`;
  try {
    //kiểm tra email đã tồn tại cho user khác chưa
    const [existingUser] = await db.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
      [email, userId]
    );
    if (existingUser.length > 0) {
      throw new Error("Email đã tồn tại cho tài khoản khác");
    }
    console.log("Updating account info:", { email, fullname, userId });
    const [result] = await db.query(sql, [email, fullname, userId]);
    return result;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin tài khoản:", error);
    throw error;
  }
};
exports.getPasswordByUserId = async (userId) => {
  const [rows] = await db.query(
    "SELECT password FROM users WHERE user_id = ? AND status = 1",
    [userId]
  );
  return rows[0];
};

exports.updatePassword = async ({ userId, currentPassword, newPassword }) => {
  try {
    const account = await this.getPasswordByUserId(userId);
    if (!account) {
      throw new Error("Tài khoản không tồn tại");
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      account.password
    );
    if (!passwordMatch) {
      throw new Error("Mật khẩu cũ không đúng");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [hashedPassword, userId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error.message);
    throw error;
  }
};
