const db = require("../../config/db.js");

exports.getAll = async () => {
  const sql = `
    SELECT * FROM customers
  `;
  const [rows] = await db.query(sql);
  return rows;
};

exports.getCustomerById = async (id) => {
  const sql = `
    SELECT * FROM customers WHERE cus_id = ?
  `;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

exports.lockCustomer = async (id) => {
  const [rows] = await db.query(
    "SELECT status FROM customers WHERE cus_id = ?",
    [id]
  );

  if (!rows || rows.length === 0) {
    throw new Error("Customer not found");
  }

  const statusNow = rows[0].status;

  if (statusNow === 0 || statusNow === "0") {
    // Nếu đang khóa -> mở khóa
    const sqlUnlock = "UPDATE customers SET status = ? WHERE cus_id = ?";
    await db.query(sqlUnlock, [1, id]);
  } else {
    // Nếu đang hoạt động -> khóa
    const sqlLock = "UPDATE customers SET status = ? WHERE cus_id = ?";
    await db.query(sqlLock, [0, id]);
  }
};
