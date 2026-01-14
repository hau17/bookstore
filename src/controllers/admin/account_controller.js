const e = require("connect-flash");
const accountService = require("../../services/admin/account_service.js");
const bcrypt = require("bcryptjs");

exports.getAccountPage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const accountInfo = await accountService.getAccountInfo(userId);

    if (!accountInfo) {
      console.error("Account not found for user ID:", userId);
      req.session.toastr = {
        type: "error",
        message: "Không tìm thấy thông tin tài khoản",
      };
      return res.redirect("/admin");
    }
    res.render("admin/account/main", {
      layout: "main-admin",
      account: accountInfo,
      title: "Thông tin tài khoản",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error getting account info:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải thông tin tài khoản",
    };
    res.redirect("/admin");
  }
};

exports.getEditAccountPage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const accountInfo = await accountService.getAccountInfo(userId);

    if (!accountInfo) {
      req.session.toastr = {
        type: "error",
        message: "Không tìm thấy thông tin tài khoản",
      };
      return res.redirect("/admin/account");
    }

    res.render("admin/account/edit", {
      layout: "main-admin",
      title: "Chỉnh sửa thông tin tài khoản",
      account: accountInfo,
    });
  } catch (error) {
    console.error("Error getting edit account page:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải trang chỉnh sửa tài khoản",
    };
    res.redirect("/admin/account");
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { email, fullname } = req.body;
    const userId = req.session.user.id;

    await accountService.updateAccountInfo({ email, fullname, userId });
    req.session.user.email = email;
    req.session.toastr = {
      type: "success",
      message: "Cập nhật thông tin thành công",
    };
    return res.redirect("/admin/account");
  } catch (error) {
    console.error("Error updating account:", error);
    req.session.toastr = {
      type: "error",
      message: error.message || "Lỗi khi cập nhật thông tin tài khoản",
    };
    return res.redirect("/admin/account/edit");
  }
};

// // Lấy trang thay đổi mật khẩu
exports.getChangePasswordPage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const accountInfo = await accountService.getAccountInfo(userId);

    if (!accountInfo) {
      req.session.toastr = {
        type: "error",
        message: "Không tìm thấy thông tin tài khoản",
      };
      return res.redirect("/admin/account");
    }

    res.render("admin/account/change-password", {
      layout: "main-admin",
      account: accountInfo,
    });
  } catch (error) {
    console.error("Error getting change password page:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải trang thay đổi mật khẩu",
    };
    res.redirect("/admin/account");
  }
};

// // Thay đổi mật khẩu
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user.id;
    await accountService.updatePassword({
      userId,
      currentPassword,
      newPassword,
    });
    req.session.toastr = {
      type: "success",
      message: "Đổi mật khẩu thành công",
    };
    res.redirect("/admin/account");
  } catch (error) {
    console.error("Error updating password:", error);
    req.session.toastr = {
      type: "error",
      message: error.message || "Lỗi khi thay đổi mật khẩu",
    };
    res.redirect("/admin/account/change-password");
  }
};
