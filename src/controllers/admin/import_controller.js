const bookService = require('../../services/admin/product_service');
const publisherService = require('../../services/admin/publisher_service');
const importService = require('../../services/admin/import_service');
exports.list = async (req, res) => {
    const publisherId = req.query.publisher;
  try {
    const books = await bookService.getAll({status:1, publisherId: publisherId});
    res.render('admin/imports/import', {
      layout: 'main-admin',
      title: 'Nhập sách',
      books,
      publishers: await publisherService.getAll({status:1}),
      selectedPublisherId: publisherId
      
    });
  } catch (error) {
    console.error('Error displaying import page:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.addImport = async (req, res) => {
  try {
    const { publisher_id, books } = req.body;
    if (!publisher_id || !books || Object.keys(books).length === 0) {
      return res.status(400).send('Dữ liệu không hợp lệ');
    }
    const importId = await importService.addImport({ publisher_id, books: Object.values(books) });
    req.flash('success', 'Nhập sách thành công');
    res.redirect('/admin/imports');
  } catch (error) {
    console.error('Error adding import:', error);
    req.flash('error', 'Lỗi server');
    res.redirect('/admin/imports');
  }
};