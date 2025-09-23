const productService = require('../../services/client/product_service.js');

exports.list = async (req, res) => {
  try {
    const products = await productService.getAll();
    res.render('client/products/list', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};


exports.showAddForm = (req, res) => {
  res.render('products/add');
};

exports.add = (req, res) => {
  productService.add(req.body);
  res.redirect('/products');
};

exports.showEditForm = (req, res) => {
  const product = productService.getById(req.params.id);
  res.render('products/edit', { product });
};

exports.update = (req, res) => {
  productService.update(req.params.id, req.body);
  res.redirect('/products');
};

exports.delete = (req, res) => {
  productService.delete(req.params.id);
  res.redirect('/products');
};
