const categoryService = require('../../services/admin/category_service.js');

exports.list = async (req, res) => {
  try {
    const filter = req.query.filter || '';
    const categories = await categoryService.getAll(filter);
    res.render('admin/categories/list', {
      categories,
      layout: 'main-admin',
      title: 'Quản lý loại sản phẩm',
      filter
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render('admin/categories/add', { layout: 'main-admin', title: 'Thêm loại sản phẩm' });
  } catch (error) {
    console.error('Error showing add form:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.add = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: 'Tên loại sản phẩm là bắt buộc' });
    }

    const category = { category_name, description };
    await categoryService.add(category);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      return res.status(404).send('Loại sản phẩm không tồn tại');
    }
    res.render('admin/categories/edit', {
      layout: 'main-admin',
      title: 'Sửa loại sản phẩm',
      category
    });
  } catch (error) {
    console.error('Error showing edit form:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.update = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { category_name, description, status } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: 'Tên loại sản phẩm là bắt buộc' });
    }

    const category = { category_id: categoryId, category_name, description, status };
    const affectedRows = await categoryService.update(category);
    if (affectedRows === 0) {
      return res.status(404).send('Loại sản phẩm không tồn tại');
    }
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send('Lỗi server');
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const result = await categoryService.toggleStatus(categoryId);
    if (result === 0) {
      return res.status(404).send('Loại sản phẩm không tồn tại');
    }
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).send('Lỗi server');
  }
};