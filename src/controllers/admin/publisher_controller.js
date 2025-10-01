const publisherService = require('../../services/admin/publisher_service.js');

exports.list = async (req, res) => {
  try {
    const filter = req.query.filter || '';
    const publishers = await publisherService.getAll(filter);
    res.render('admin/publishers/list', { 
      publishers, layout: 'main-admin', 
      title: 'Quản lý nhà xuất bản' , 
      filter });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};

exports.getById = async (req, res) => {
  try {
    const publisher = await publisherService.getById(req.params.id);
    if (!publisher) {
      return res.status(404).send('Nhà xuất bản không tồn tại');
    }
    res.json(publisher);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render('admin/publishers/add', { layout: 'main-admin', title: 'Thêm nhà xuất bản' });
  } catch (error) {
    console.error('Error showing add form:', error);
    return res.status(500).json({ error: 'Failed to load add form' });
  }
};

exports.add = async (req, res) => {
  try {
    const { publisher_name, address, phone_number, description, status } = req.body;

    if (!publisher_name) {
      return res.status(400).json({ error: 'Tên nhà xuất bản là bắt buộc' });
    }

    const publisher = {
      publisher_name,
      address,
      phone_number,
      description,
      status
    };

    await publisherService.add(publisher);
    res.redirect('/admin/publishers');
  } catch (error) {
    console.error('Error adding publisher:', error);
    return res.status(500).json({ error: 'Database insert failed: ' + error.message });
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const publisher = await publisherService.getById(req.params.id);
    if (!publisher) {
      return res.status(404).send('Nhà xuất bản không tồn tại');
    }
    res.render('admin/publishers/edit', {
      layout: 'main-admin',
      title: 'Sửa nhà xuất bản',
      publisher
    });
  } catch (error) {
    console.error('Error showing edit form:', error);
    return res.status(500).json({ error: 'Failed to load edit form' });
  }
};

exports.update = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const { publisher_name, address, phone_number, description, status } = req.body;

    if (!publisher_name) {
      return res.status(400).json({ error: 'Tên nhà xuất bản là bắt buộc' });
    }

    const publisher = {
      publisher_id: publisherId,
      publisher_name,
      address,
      phone_number,
      description,
      status
    };

    const affectedRows = await publisherService.update(publisher);
    if (affectedRows === 0) {
      return res.status(404).send('Nhà xuất bản không tồn tại');
    }
    res.redirect('/admin/publishers');
  } catch (error) {
    console.error('Error updating publisher:', error);
    return res.status(500).json({ error: 'Database update failed: ' + error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const result = await publisherService.toggleStatus(publisherId);
    if (result.affectedRows === 0) {
      return res.status(404).send('Nhà xuất bản không tồn tại');
    }
    res.redirect('/admin/publishers');
  } catch (error) {
    console.error('Error toggling publisher status:', error);
    return res.status(500).json({ error: 'Database update failed: ' + error.message });
  }
};