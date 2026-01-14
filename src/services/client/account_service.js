const db = require("../../config/db.js");
const bcrypt = require("bcrypt");

exports.authenticateCustomer = async (username, password) => {
  const sql = `
    SELECT cus_id, email, fullname, phone_number, password, status
    FROM customers
    WHERE (email = ?)
    AND status = 1
    LIMIT 1
  `;
  try {
    const [rows] = await db.query(sql, [username]);

    if (rows.length === 0) {
      throw new Error("Tài khoản không tồn tại");
    }
    if (rows[0].status !== 1) {
      throw new Error("Tài khoản đã bị khóa");
    }
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Mật khẩu không chính xác");
    }

    // Don't send password back
    delete user.password;
    return user;
  } catch (err) {
    console.error("DB Error:", err.message);
    throw err;
  }
};

exports.registerCustomer = async ({
  fullname,
  email,
  phone_number,
  address,
  password,
}) => {
  try {
    //kiểm tra

    // Check if email exists
    const [existingEmail] = await db.query(
      "SELECT cus_id FROM customers WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingEmail.length > 0) {
      throw new Error("Email đã được sử dụng");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO customers 
      (fullname, phone_number, address, email, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      fullname,
      phone_number,
      address,
      email,
      hashedPassword,
    ]);
    const customerId = result.insertId;
    console.log("New customer ID:", customerId);
    // Create an empty cart for the new customer
    const cartSql = `
      INSERT INTO carts (cus_id)
      VALUES (?)
    `;

    await db.query(cartSql, [customerId]);

    return customerId;
  } catch (error) {
    console.error("Registration Error:", error.message);
    throw error;
  }
};

exports.getCustomerById = async (cus_id) => {
  const sql = `
    SELECT cus_id, fullname, phone_number, address, email, created_at, status
    FROM customers
    WHERE cus_id = ?
    LIMIT 1
  `;
  try {
    const [rows] = await db.query(sql, [cus_id]);
    if (rows.length === 0) {
      throw new Error("Customer not found");
    }
    return rows[0];
  } catch (error) {
    console.error("DB Error:", error.message);
    throw error;
  }
};

exports.updateCustomer = async (
  cus_id,
  { fullname, email, phone_number, address }
) => {
  // Check if email is already used by another customer
  const [existingEmail] = await db.query(
    "SELECT cus_id FROM customers WHERE email = ? AND cus_id != ? LIMIT 1",
    [email, cus_id]
  );
  if (existingEmail.length > 0) {
    throw new Error("Email đã được sử dụng");
  }

  // Check if phone number is already used by another customer
  const [existingPhone] = await db.query(
    "SELECT cus_id FROM customers WHERE phone_number = ? AND cus_id != ? LIMIT 1",
    [phone_number, cus_id]
  );

  const sql = `
    UPDATE customers
    SET fullname = ?, email = ?, phone_number = ?, address = ?
    WHERE cus_id = ?
  `;
  try {
    const [result] = await db.query(sql, [
      fullname,
      email,
      phone_number,
      address,
      cus_id,
    ]);
    if (result.affectedRows === 0) {
      throw new Error("Không thể cập nhật thông tin");
    }
    return result.affectedRows;
  } catch (error) {
    console.error("Update Error:", error.message);
    throw error;
  }
};

exports.changePassword = async (cus_id, { oldPassword, newPassword }) => {
  // Get current password
  const sql = "SELECT password FROM customers WHERE cus_id = ? LIMIT 1";
  try {
    const [rows] = await db.query(sql, [cus_id]);
    if (rows.length === 0) {
      throw new Error("Khách hàng không tồn tại");
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Mật khẩu hiện tại không chính xác");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updateSql = "UPDATE customers SET password = ? WHERE cus_id = ?";
    await db.query(updateSql, [hashedPassword, cus_id]);
    return true;
  } catch (error) {
    console.error("Change Password Error:", error.message);
    throw error;
  }
};
