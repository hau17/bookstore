const db = require("../../config/db.js");
const calculatePrices = (books) => {
  books.forEach((book) => {
    const avg = Number(book.avg_import_price || 0);
    const profit = Number(book.profit_percentage || 0);
    const discount = Number(book.discount_percentage || 0);

    // Giá gốc trước khi giảm
    book.original_price = Math.round(avg * (1 + profit / 100));

    // Giá bán sau khi giảm
    book.selling_price = Math.round(book.original_price * (1 - discount / 100));
  });
};

exports.getProductsWithLimit = async ({
  category,
  search,
  page,
  limit,
} = {}) => {
  const offset = (Number(page) - 1) * Number(limit);
  try {
    let base = `
      SELECT 
      b.book_id,
      b.book_title,
      b.avg_import_price,
      b.discount_percentage,
      b.profit_percentage,
      b.stock_quantity,
      b.description,
      b.image_path,
      b.created_at,
      b.status,
      b.publisher_id,
      c.category_name,
      a.author_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.status = 1 AND b.stock_quantity > 0
  `;
    const params = [];
    const countParams = [];

    if (category) {
      base += " AND b.category_id = ?";
      params.push(category);
      countParams.push(category);
    }

    if (search) {
      base +=
        " AND (b.book_title LIKE ? OR a.author_name LIKE ? OR p.publisher_name LIKE ?) ";

      const searchPattern = `%${search}%`;
      params.push(searchPattern);
      params.push(searchPattern);
      params.push(searchPattern);
      countParams.push(searchPattern);
      countParams.push(searchPattern);
      countParams.push(searchPattern);
    }

    // append order
    base += " ORDER BY b.created_at DESC ";

    base += " LIMIT ? OFFSET ?";
    params.push(Number(limit));
    params.push(Number(offset));

    const [products] = await db.execute(base, params);
    calculatePrices(products);

    let countSql = `
      SELECT COUNT(*) as total
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      WHERE b.status = 1 AND b.stock_quantity > 0
    `;
    if (category) countSql += " AND b.category_id = ?";
    if (search)
      countSql +=
        " AND (b.book_title LIKE ? OR a.author_name LIKE ? OR p.publisher_name LIKE ?)";

    const [countRows] = await db.execute(countSql, countParams);
    const total = countRows[0] ? countRows[0].total : 0;

    return { products, total };
  } catch (error) {
    console.error("Error fetching products with limit:", error);
    throw error;
  }
};

exports.getProductById = async (id) => {
  try {
    let query = `
  SELECT 
      b.book_id,
      b.book_title,
      b.avg_import_price,
      b.discount_percentage,
      b.profit_percentage,
      b.stock_quantity,
      b.description,
      b.image_path,
      b.created_at,
      b.status,
      b.publisher_id,
      c.category_name,
      a.author_name,
      p.publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.book_id = ?
  `;
    const [rows] = await db.execute(query, [id]);

    calculatePrices(rows);

    return rows[0];
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};
