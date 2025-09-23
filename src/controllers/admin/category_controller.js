const productService = require('../../services/admin/category_service.js');

exports.list = async (req, res) => {
  try {
    const products = await productService.getAll();
    res.render('admin/products/list', { products ,layout:'main-admin',title:'Quản lý sản phẩm'});
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};