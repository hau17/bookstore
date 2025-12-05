const userService = require("../../services/admin/user_service");

exports.list = async (req, res) => {
  try {
    const statusFilter = req.query.status;
    const roleFilter = req.query.role;

    const users = await userService.getAllUser({
      status: statusFilter,
      role: roleFilter,
    });

    res.render("admin/user/list", {
      layout: "main-admin",
      title: "Quản lí nhân viên",
      users,
      statusFilter,
      roleFilter,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    req.session.toastr = {
      type: "error",
      message: "Có lỗi xảy ra khi tải danh sách nhân viên",
    };
    res.redirect("/admin/users");
  }
};

exports.showAddForm = async (req, res) => {
  try {
    res.render("admin/user/add", {
      layout: "main-admin",
      title: "Thêm nhân viên",
    });
  } catch (error) {
    console.error("Error showing add form:", error);
    req.session.toastr = {
      type: "error",
      message: "Có lỗi xảy ra",
    };
    res.redirect("/admin/users");
  }
};

exports.add = async (req, res) => {
  try {
    const { email, password, fullname, role } = req.body;

    if (!email || !password || !fullname || !role) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      };
      return res.redirect("/admin/users/add");
    }

    await userService.add({ email, password, fullname, role });

    req.session.toastr = {
      type: "success",
      message: "Thêm nhân viên thành công",
    };
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error adding user:", error);
    req.session.toastr = {
      type: "error",
      message: error.message || "Có lỗi xảy ra khi thêm nhân viên",
    };
    res.redirect("/admin/users/add");
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    if (!user) {
      req.session.toastr = {
        type: "error",
        message: "Không tìm thấy nhân viên",
      };
      return res.redirect("/admin/users");
    }

    res.render("admin/user/edit", {
      layout: "main-admin",
      title: "Chỉnh sửa nhân viên",
      user,
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    req.session.toastr = {
      type: "error",
      message: "Có lỗi xảy ra",
    };
    res.redirect("/admin/users");
  }
};

exports.edit = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, fullname, role } = req.body;

    if (!email || !fullname || !role) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      };
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    await userService.update({ userId, email, password, fullname, role });

    req.session.toastr = {
      type: "success",
      message: "Cập nhật nhân viên thành công",
    };
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error updating user:", error);
    req.session.toastr = {
      type: "error",
      message: error.message || "Có lỗi xảy ra khi cập nhật nhân viên",
    };
    res.redirect(`/admin/users/${req.params.id}/edit`);
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    await userService.toggleStatus(userId);

    req.session.toastr = {
      type: "success",
      message: "Cập nhật trạng thái thành công",
    };
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error toggling user status:", error);
    req.session.toastr = {
      type: "error",
      message: "Có lỗi xảy ra khi cập nhật trạng thái",
    };
    res.redirect("/admin/users");
  }
};
