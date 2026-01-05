const authorService = require("../../services/admin/author_service.js");

exports.list = async (req, res) => {
  const status = req.query.status || "";
  let title = "Quản lý tác giả";
  try {
    const authors = await authorService.getAll({ status: status });
    res.render("admin/authors/list", {
      authors,
      layout: "main-admin",
      title,
      status: status,
    });
  } catch (err) {
    console.error(err);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách tác giả",
    };
    res.redirect("/admin");
  }
};

exports.getById = async (req, res) => {
  try {
    const author = await authorService.getById(req.params.id);
    if (!author) {
      req.session.toastr = {
        type: "error",
        message: "Tác giả không tồn tại",
      };
      return res.redirect("/admin/authors");
    }
    res.json(author);
  } catch (err) {
    console.error(err);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải thông tin tác giả",
    };
    res.redirect("/admin/authors");
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render("admin/authors/add", {
      layout: "main-admin",
      title: "Thêm tác giả",
    });
  } catch (error) {
    console.error("Error showing add form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi hiển thị form thêm tác giả",
    };
    res.redirect("/admin/authors");
  }
};

exports.add = async (req, res) => {
  try {
    const { author_name, email, description } = req.body;

    if (!author_name) {
      req.session.toastr = {
        type: "error",
        message: "Tên tác giả là bắt buộc",
      };
      return res.redirect("/admin/authors/add");
    }

    const author = {
      author_name,
      email,
      description,
    };

    await authorService.add(author);
    req.session.toastr = {
      type: "success",
      message: "Thêm tác giả thành công",
    };
    res.redirect("/admin/authors");
  } catch (error) {
    console.error("Error adding author:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi thêm tác giả",
    };
    res.redirect("/admin/authors");
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const author = await authorService.getById(req.params.id);
    if (!author) {
      req.session.toastr = {
        type: "error",
        message: "Tác giả không tồn tại",
      };
      return res.redirect("/admin/authors");
    }
    res.render("admin/authors/edit", {
      layout: "main-admin",
      title: "Sửa tác giả",
      author,
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi hiển thị form sửa tác giả",
    };
    res.redirect("/admin/authors");
  }
};

exports.update = async (req, res) => {
  try {
    const authorId = req.params.id;
    const { author_name, email, description } = req.body;

    if (!author_name) {
      req.session.toastr = {
        type: "error",
        message: "Tên tác giả là bắt buộc",
      };
      return res.redirect("/admin/authors/edit/" + authorId);
    }

    const author = {
      author_name,
      email,
      description,
      author_id: authorId,
    };

    const affectedRows = await authorService.update(author);
    if (affectedRows === 0) {
      req.session.toastr = {
        type: "error",
        message: "Tác giả không tồn tại",
      };
      return res.redirect("/admin/authors");
    }
    req.session.toastr = {
      type: "success",
      message: "Cập nhật tác giả thành công",
    };
    res.redirect("/admin/authors");
  } catch (error) {
    console.error("Error updating author:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật tác giả",
    };
    res.redirect("/admin/authors");
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const authorId = req.params.id;
    const affectedRows = await authorService.toggleStatus(authorId);
    if (affectedRows === 0) {
      req.session.toastr = {
        type: "error",
        message: "Tác giả không tồn tại",
      };
      return res.redirect("/admin/authors");
    }
    req.session.toastr = {
      type: "success",
      message: "Cập nhật trạng thái tác giả thành công",
    };
    res.redirect("/admin/authors");
  } catch (error) {
    console.error("Error toggling author status:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật trạng thái tác giả",
    };
    res.redirect("/admin/authors");
  }
};
