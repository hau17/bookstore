const categoryService = require("../../services/admin/category_service.js");

exports.list = async (req, res) => {
  try {
    const status = req.query.status || "";
    const categories = await categoryService.getAll({ status: status });
    res.render("admin/categories/list", {
      categories,
      layout: "main-admin",
      title: "Quản lý loại sản phẩm",
      status,
    });
  } catch (err) {
    console.error(err);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách loại sản phẩm",
    };
    res.redirect("/admin");
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render("admin/categories/add", {
      layout: "main-admin",
      title: "Thêm loại sản phẩm",
    });
  } catch (error) {
    console.error("Error showing add form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi hiển thị form thêm loại sản phẩm",
    };
    res.redirect("/admin/categories");
  }
};

exports.add = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      req.session.toastr = {
        type: "error",
        message: "Tên loại sản phẩm là bắt buộc",
      };
      return res.redirect("/admin/categories/add");
    }

    const category = { category_name, description };
    await categoryService.add(category);
    req.session.toastr = {
      type: "success",
      message: "Thêm loại sản phẩm thành công",
    };
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Error adding category:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi thêm loại sản phẩm",
    };
    res.redirect("/admin/categories");
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      req.session.toastr = {
        type: "error",
        message: "Loại sản phẩm không tồn tại",
      };
      return res.redirect("/admin/categories");
    }
    res.render("admin/categories/edit", {
      layout: "main-admin",
      title: "Sửa loại sản phẩm",
      category,
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi hiển thị form sửa loại sản phẩm",
    };
    res.redirect("/admin/categories");
  }
};

exports.update = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { category_name, description, status } = req.body;

    if (!category_name) {
      req.session.toastr = {
        type: "error",
        message: "Tên loại sản phẩm là bắt buộc",
      };
      return res.redirect(`/admin/categories/edit/${categoryId}`);
    }

    const category = {
      category_id: categoryId,
      category_name,
      description,
      status,
    };
    const affectedRows = await categoryService.update(category);
    if (affectedRows === 0) {
      req.session.toastr = {
        type: "error",
        message: "Loại sản phẩm không tồn tại",
      };
      return res.redirect("/admin/categories");
    }
    req.session.toastr = {
      type: "success",
      message: "Cập nhật loại sản phẩm thành công",
    };
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Error updating category:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật loại sản phẩm",
    };
    res.redirect("/admin/categories");
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const result = await categoryService.toggleStatus(categoryId);
    if (result === 0) {
      req.session.toastr = {
        type: "error",
        message: "Loại sản phẩm không tồn tại",
      };
      return res.redirect("/admin/categories");
    }
    req.session.toastr = {
      type: "success",
      message: "Cập nhật trạng thái loại sản phẩm thành công",
    };
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Error toggling category status:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật trạng thái loại sản phẩm",
    };
    res.redirect("/admin/categories");
  }
};
