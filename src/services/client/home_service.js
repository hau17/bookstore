const db = require("../../config/db.js");

exports.getAllData = async () => {
  let sqlNewBooks = `
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
    WHERE stock_quantity > 0
    ORDER BY created_at DESC
    LIMIT 10;
    `;
  let sqlDiscountedBooks = `
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
    WHERE stock_quantity > 0
    ORDER BY b.discount_percentage DESC
    LIMIT 10;
    `;
  const calculatePrices = (books) => {
    books.forEach((book) => {
      const avg = Number(book.avg_import_price || 0);
      const profit = Number(book.profit_percentage || 0);
      const discount = Number(book.discount_percentage || 0);

      // Giá gốc trước khi giảm
      book.original_price = Math.round(avg * (1 + profit / 100));

      // Giá bán sau khi giảm
      book.selling_price = Math.round(
        book.original_price * (1 - discount / 100)
      );
    });
  };

  const [newBooks] = await db.query(sqlNewBooks);
  const [discountedBooks] = await db.query(sqlDiscountedBooks);

  // Tính giá cho cả 2 mảng
  calculatePrices(newBooks);
  calculatePrices(discountedBooks);
  return { newBooks, discountedBooks };
};
