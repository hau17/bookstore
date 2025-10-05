const db = require('../../config/db.js');

exports.addImport = async ({ publisher_id, books }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Insert into imports table
        const [importResult] = await connection.query(
            'INSERT INTO imports (publisher_id) VALUES (?)',
            [publisher_id]
        );
        // Lỗi 1: Cần dùng insertId để lấy ID của hàng vừa tạo
        const import_id = importResult.insertId; 

        // 2. Insert into import_details table & Update books table
        for (const book of books) {
            
            // Lỗi 2: Dữ liệu nhận vào có book ID là 'id' chứ không phải 'book_id'
            const bookId = book.book_id; 
            const quantity = parseInt(book.quantity); // Đảm bảo là số
            const importPrice = parseFloat(book.import_price); // Đảm bảo là số

            // 2a. Insert into import_details (Sử dụng bookId và import_id đã sửa)
            await connection.query(
                'INSERT INTO import_details (import_id, book_id, quantity, import_price) VALUES (?, ?, ?, ?)',
                [import_id, bookId, quantity, importPrice] // Đã đổi price -> import_price
            );

            // 2b. Lấy thông tin hiện tại của sách (cần thiết cho tính toán giá trung bình mới)
            const [[currentBook]] = await connection.query(
                'SELECT stock_quantity, avg_import_price, profit_percentage FROM books WHERE book_id = ? FOR UPDATE',
                [bookId]
            );

            if (!currentBook) {
                throw new Error(`Book with ID ${bookId} not found.`);
            }

            const oldQuantity = currentBook.stock_quantity;
            const oldAvgPrice = currentBook.avg_import_price;

            // Tính toán giá trung bình mới (New Weighted Average Price)
            const newAvgImportPrice = 
                ((oldAvgPrice * oldQuantity) + (importPrice * quantity)) / (oldQuantity + quantity);
            
            // Tính toán giá bán mới (New Sale Price)
            const newPrice = newAvgImportPrice * (1 + currentBook.profit_percentage / 100);


            // 2c. Update books table (Đã sửa công thức)
            await connection.query(
                `UPDATE books
                 SET 
                    stock_quantity = stock_quantity + ?,
                    avg_import_price = ?,
                    price = ?
                 WHERE book_id = ?`,
                [quantity, newAvgImportPrice, newPrice, bookId]
            );
        }

        await connection.commit();
        return import_id;
    } catch (error) {
        await connection.rollback();
        console.error('Error adding import:', error);
        throw new Error('Database transaction failed: ' + error.message);
    } finally {
        connection.release();
    }
};