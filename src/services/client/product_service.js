const db = require("../../config/db.js");

const enrichBooks = (books = []) => {
  return books.map((book) => {
    const avg = Number(book.avg_import_price || 0);
    const profit = Number(book.profit_percentage || 0);
    const discount = Number(book.discount_percentage || 0);

    const original_price = Math.round(avg * (1 + profit / 100));
    const selling_price = Math.round(original_price * (1 - discount / 100));

    return {
      ...book,
      original_price,
      selling_price,
      has_discount: discount > 0,
    };
  });
};

exports.getProductsWithPagination = async ({
  category,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  page = Math.max(1, Number(page));
  limit = Math.max(1, Number(limit));
  const offset = (page - 1) * limit;

  let baseSql = `
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    LEFT JOIN authors a ON b.author_id = a.author_id
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    WHERE b.status = 1 AND b.stock_quantity > 0
  `;

  const params = [];

  if (category) {
    baseSql += " AND b.category_id = ?";
    params.push(category);
  }

  if (search) {
    baseSql += `
      AND (
        b.book_title LIKE ?
        OR a.author_name LIKE ?
        OR p.publisher_name LIKE ?
      )
    `;
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }

  const dataSql = `
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
      c.category_name,
      a.author_name,
      p.publisher_name
    ${baseSql}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    ${baseSql}
  `;

  const [rows] = await db.execute(dataSql, [...params, limit, offset]);
  const [countRows] = await db.execute(countSql, params);

  const total = countRows[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const products = enrichBooks(rows);
  return {
    products,
    pagination: {
      page,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
    },
  };
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

    return enrichBooks(rows)[0];
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};
