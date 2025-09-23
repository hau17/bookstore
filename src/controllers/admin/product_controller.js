const productService = require('../../services/admin/product_service.js');
const categoryService = require('../../services/admin/category_service.js');
const authorService = require('../../services/admin/author_service.js');
const publisherService = require('../../services/admin/publisher_service.js');
exports.list = async (req, res) => {
  
  try {
    const filter = req.query.filter || '';
    let products;
    if (filter === 'active') {
      products = await productService.getAll(1); 
    } else if (filter === 'inactive') {
      products = await productService.getAll(0);
    } else {
      products = await productService.getAll(); 
    } 
    let title = 'Tất cả sản phẩm';
    if (filter === 'active') title = 'Sản phẩm đang bán';
    else if (filter === 'inactive') title = 'Sản phẩm ngừng bán';
    res.render('admin/products/list', {
      layout: 'main-admin',
      title,
      products,
      filter
    });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};

exports.showAddForm = async (req, res) => {
  try {
    const categories= await categoryService.getAll(); 
    const authors = await authorService.getAll();
    const publishers = await publisherService.getAll();
    res.render('admin/products/add', { layout: 'main-admin', title: 'Thêm sản phẩm' ,
       categories: categories,
       authors: authors,
       publishers: publishers});
  } catch (error) {
    console.error('Error showing add form:', error);
    return res.status(500).json({ error: 'Failed to load add form' });
  }
};

exports.add = async(req, res) => {
  try {
      const {
        book_title,
        category_id,
        author_id,
        publisher_id,
        price,
        discount_percentage,
        stock_quantity,
        description,
    } = req.body;

    if (!book_title || !category_id || !author_id || !publisher_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const image_path = req.file ? '/img/products/' + req.file.filename : null;
      const product = {
        book_title,
        category_id,
        author_id,
        publisher_id,
        price,
        discount_percentage,
        stock_quantity,
        description,
        image_path,
    };

    await productService.add(product);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Database insert failed: ' + error.message });
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }
    const categories = await categoryService.getAll();
    const authors = await authorService.getAll();
    const publishers = await publisherService.getAll();
    res.render('admin/products/edit', {
      layout: 'main-admin',
      title: 'Sửa sản phẩm',
      product,
      categories,
      authors,
      publishers
    });
  } catch (error) {
    console.error('Error showing edit form:', error);
    return res.status(500).json({ error: 'Failed to load edit form' });
  }
}

exports.edit = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      description
    } = req.body;

    if (!book_title || !category_id || !author_id || !publisher_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const oldProduct = await productService.getProductById(productId); // Lấy ảnh cũ
    const image_path = req.file
    ? '/img/products/' + req.file.filename
    : oldProduct.image_path; // Giữ ảnh cũ nếu không có ảnh mới

    const product = {
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      description,
      image_path,
      book_id: productId
    };  
    await productService.update( product);
    res.redirect('/admin/products');
  }
  catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Database update failed: ' + error.message });
  }
}

// Cập nhật trạng thái (khóa/mở khóa)
exports.toggleStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await productService.toggleStatus(productId);
    if (result.affectedRows === 0) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }
    res.redirect('/admin/products');
    // res.status(200).json({ message: 'Trạng thái sản phẩm đã được cập nhật' });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.delete = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await productService.delete(productId);
    if (result.affectedRows === 0) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }
    res.redirect('/admin/products');
    // res.status(200).json({ message: 'Sản phẩm đã được xóa thành công' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Lỗi server');
  }
};