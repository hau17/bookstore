const authorService = require('../../services/admin/author_service.js');

exports.list = async (req, res) => {
  const filter = req.query.filter || '';
  let title = 'Quản lý tác giả';
  if (filter === 'active') {
    title += ' - Đang hoạt động';
  } else if (filter === 'inactive') {
    title += ' - Ngừng hoạt động';
  }
  try {
    const authors = await authorService.getAll(filter);
    res.render('admin/authors/list',
       { authors, layout: 'main-admin', title, filter });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};

exports.getById = async (req, res) => {
  try {
    const author = await authorService.getById(req.params.id);
    if (!author) {
      return res.status(404).send('Tác giả không tồn tại');
    }
    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render('admin/authors/add', { layout: 'main-admin', title: 'Thêm tác giả' });
  } catch (error) {
    console.error('Error showing add form:', error);
    return res.status(500).json({ error: 'Failed to load add form' });
  }
};

exports.add = async (req, res) => {
  try {
    const { author_name, description } = req.body;

    if (!author_name) {
      return res.status(400).json({ error: 'Tên tác giả là bắt buộc' });
    }

    const author = {
      author_name,
      description
    };

    await authorService.add(author);
    res.redirect('/admin/authors');
  } catch (error) {
    console.error('Error adding author:', error);
    return res.status(500).json({ error: 'Database insert failed: ' + error.message });
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const author = await authorService.getById(req.params.id);
    if (!author) {
      return res.status(404).send('Tác giả không tồn tại');
    }
    res.render('admin/authors/edit', {
      layout: 'main-admin',
      title: 'Sửa tác giả',
      author
    });
  } catch (error) {
    console.error('Error showing edit form:', error);
    return res.status(500).json({ error: 'Failed to load edit form' });
  }
};

exports.update = async (req, res) => {
  try {
    const authorId = req.params.id;
    const { author_name, description } = req.body;

    if (!author_name) {
      return res.status(400).json({ error: 'Tên tác giả là bắt buộc' });
    }

    const author = {
      author_name,
      description,
      author_id: authorId
    };

    const affectedRows = await authorService.update(author);
    if (affectedRows === 0) {
      return res.status(404).send('Tác giả không tồn tại');
    }
    res.redirect('/admin/authors');
  } catch (error) {
    console.error('Error updating author:', error);
    return res.status(500).json({ error: 'Database update failed: ' + error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const authorId = req.params.id;
    const affectedRows = await authorService.toggleStatus(authorId);
    if (affectedRows === 0) {
      return res.status(404).send('Tác giả không tồn tại');
    }
    res.redirect('/admin/authors');
  } catch (error) {
    console.error('Error toggling author status:', error);
    return res.status(500).json({ error: 'Database update failed: ' + error.message });
  }
};