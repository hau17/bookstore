const db = require("../../config/db.js");

exports.getAll = async ({ status }) => {
  let sql = "SELECT user_id as cus_id, fullname, email, phone_number, address, status, created_at FROM users WHERE role = 'customer'";
  const params = [];

  if (status === "1" || status === "0") {
    sql += " AND status = ?";
    params.push(status);
  }

  const [rows] = await db.query(sql, params);
  return rows;
};

exports.getCustomerById = async (id) => {
  const sql = `
    SELECT user_id as cus_id, fullname, email, phone_number, address, status, created_at 
    FROM users WHERE user_id = ? AND role = 'customer'
  `;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

exports.lockCustomer = async (id) => {
  const [rows] = await db.query(
    "SELECT status FROM users WHERE user_id = ? AND role = 'customer'",
    [id]
  );

  if (!rows || rows.length === 0) {
    throw new Error("Customer not found");
  }

  const statusNow = rows[0].status;

  if (statusNow === 0 || statusNow === "0") {
    // Nếu đang khóa -> mở khóa
    const sqlUnlock = "UPDATE users SET status = ? WHERE user_id = ? AND role = 'customer'";
    await db.query(sqlUnlock, [1, id]);
  } else {
    // Nếu đang hoạt động -> khóa
    const sqlLock = "UPDATE users SET status = ? WHERE user_id = ? AND role = 'customer'";
    await db.query(sqlLock, [0, id]);
  }
};
