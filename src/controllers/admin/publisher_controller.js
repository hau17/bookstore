const publisherService = require("../../services/admin/publisher_service.js");

exports.list = async (req, res) => {
  try {
    const status = req.query.status || "";

    const publishers = await publisherService.getAll({ status: status });

    res.render("admin/publishers/list", {
      publishers,
      layout: "main-admin",
      title: "Quản lý nhà xuất bản",
      status: status, // Giữ lại chuỗi để hiển thị trạng thái bộ lọc trên View
    });
  } catch (err) {
    console.error(err);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách nhà xuất bản",
    };
    res.redirect("/admin");
  }
};
exports.getById = async (req, res) => {
  try {
    const publisher = await publisherService.getById(req.params.id);
    if (!publisher) {
      req.session.toastr = {
        type: "error",
        message: "Nhà xuất bản không tồn tại",
      };
      return res.redirect("/admin/publishers");
    }
    res.json(publisher);
  } catch (err) {
    console.error(err);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải thông tin nhà xuất bản",
    };
    res.redirect("/admin/publishers");
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render("admin/publishers/add", {
      layout: "main-admin",
      title: "Thêm nhà xuất bản",
    });
  } catch (error) {
    console.error("Error showing add form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi hiển thị form thêm nhà xuất bản",
    };
    res.redirect("/admin/publishers");
  }
};

exports.add = async (req, res) => {
  try {
    const {
      publisher_name,
      address,
      phone_number,
      email,
      description,
      status,
    } = req.body;

    const publisher = {
      publisher_name,
      address,
      phone_number,
      email,
      description,
      status,
    };

    await publisherService.add(publisher);
    req.session.toastr = {
      type: "success",
      message: "Thêm nhà xuất bản thành công",
    };
    res.redirect("/admin/publishers");
  } catch (error) {
    console.error("Error adding publisher:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi thêm nhà xuất bản",
    };
    res.redirect("/admin/publishers/add");
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const publisher = await publisherService.getById(req.params.id);
    if (!publisher) {
      req.session.toastr = {
        type: "error",
        message: "Nhà xuất bản không tồn tại",
      };
      return res.redirect("/admin/publishers");
    }
    res.render("admin/publishers/edit", {
      layout: "main-admin",
      title: "Sửa nhà xuất bản",
      publisher,
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải thông tin nhà xuất bản",
    };
    res.redirect("/admin/publishers");
  }
};

exports.update = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const {
      publisher_name,
      address,
      phone_number,
      email,
      description,
      status,
    } = req.body;
    if (!publisher_name) {
      req.session.toastr = {
        type: "error",
        message: "Tên nhà xuất bản là bắt buộc",
      };
      return res.redirect(`/admin/publishers/${publisherId}/edit`);
    }

    const publisher = {
      publisher_id: publisherId,
      publisher_name,
      address,
      phone_number,
      email,
      description,
      status,
    };

    const affectedRows = await publisherService.update(publisher);
    if (affectedRows === 0) {
      req.session.toastr = {
        type: "error",
        message: "Nhà xuất bản không tồn tại",
      };
      return res.redirect("/admin/publishers");
    }
    req.session.toastr = {
      type: "success",
      message: "Cập nhật nhà xuất bản thành công",
    };
    res.redirect("/admin/publishers");
  } catch (error) {
    console.error("Error updating publisher:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật nhà xuất bản",
    };
    res.redirect(`/admin/publishers/${req.params.id}/edit`);
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const result = await publisherService.toggleStatus(publisherId);
    if (result.affectedRows === 0) {
      req.session.toastr = {
        type: "error",
        message: "Nhà xuất bản không tồn tại",
      };
      return res.redirect("/admin/publishers");
    }
    req.session.toastr = {
      type: "success",
      message: "Cập nhật trạng thái nhà xuất bản thành công",
    };
    res.redirect("/admin/publishers");
  } catch (error) {
    console.error("Error toggling publisher status:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật trạng thái nhà xuất bản",
    };
    res.redirect("/admin/publishers");
  }
};
