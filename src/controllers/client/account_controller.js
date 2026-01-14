const accountService = require("../../services/client/account_service.js");
const { validationResult } = require("express-validator");

exports.getLoginPage = (req, res) => {
  res.render("client/account/login", { layout: "main", title: "Đăng nhập" });
};

exports.getRegisterPage = (req, res) => {
  const formData = req.session.formData || {};
  delete req.session.formData;

  res.render("client/account/register", {
    layout: "main",
    title: "Đăng ký",
    formData,
  });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Kiểm tra input
    if (!username || !password) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng nhập đầy đủ thông tin đăng nhập",
      };
      return res.redirect("/account/login");
    }

    // 2. Gọi service để kiểm tra đăng nhập
    const user = await accountService.authenticateCustomer(username, password);

    // 3. Lưu thông tin vào session
    req.session.customer = {
      id: user.cus_id,
      email: user.email,
      fullname: user.fullname,
    };

    // 4. thông báo
    req.session.toastr = {
      type: "success",
      message: "Đăng nhập thành công!",
    };
    return res.redirect("/account");
  } catch (err) {
    console.error("Lỗi đăng nhập:", err.message);
    req.session.toastr = {
      type: "error",
      message: err.message || "Thông tin đăng nhập không chính xác!",
    };
    return res.redirect("/account/login");
  }
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  const { fullname, email, phone_number, address, password } = req.body;

  if (!errors.isEmpty()) {
    req.session.toastr = {
      type: "error",
      message: errors.array()[0].msg,
    };

    req.session.formData = {
      fullname,
      email,
      phone_number,
      address,
    };

    return res.redirect("/account/register");
  }

  try {
    const customerId = await accountService.registerCustomer({
      fullname,
      email,
      phone_number,
      address,
      password,
    });

    // auto login
    req.session.customer = {
      id: customerId,
      email,
      fullname,
    };

    req.session.toastr = {
      type: "success",
      message: "Đăng ký tài khoản thành công!",
    };

    res.redirect("/account");
  } catch (err) {
    req.session.toastr = {
      type: "error",
      message: err.message || "Có lỗi xảy ra khi đăng ký",
    };

    req.session.formData = {
      fullname,
      email,
      phone_number,
      address,
    };

    res.redirect("/account/register");
  }
};

exports.logout = (req, res) => {
  req.session.toastr = {
    type: "success",
    message: "Đăng xuất thành công!",
  };

  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi đăng xuất:", err);
    }
    res.redirect("/");
  });
};

exports.getAccountPage = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const id = req.session.customer.id;
  try {
    const customer = await accountService.getCustomerById(id);
    res.render("client/account/main", {
      layout: "main",
      customer,
      title: "Thông tin tài khoản",
    });
  } catch (err) {
    console.error("Lỗi:", err);
    res.redirect("/account");
  }
};

exports.getEditAccountPage = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const id = req.session.customer.id;
  try {
    const customer = await accountService.getCustomerById(id);
    res.render("client/account/edit", {
      layout: "main",
      customer,
      title: "Cập nhật thông tin",
    });
  } catch (err) {
    console.error("Lỗi:", err);
    res.redirect("/account");
  }
};

exports.postUpdateAccount = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const id = req.session.customer.id;
  const { fullname, email, phone_number, address } = req.body;

  try {
    if (!fullname || !email || !phone_number || !address) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      };
      return res.redirect("/account/edit");
    }

    await accountService.updateCustomer(id, {
      fullname,
      email,
      phone_number,
      address,
    });

    // Update session
    req.session.customer.fullname = fullname;
    req.session.customer.email = email;

    req.session.toastr = {
      type: "success",
      message: "Cập nhật thông tin thành công!",
    };
    res.redirect("/account");
  } catch (err) {
    console.error("Lỗi cập nhật:", err.message);
    req.session.toastr = {
      type: "error",
      message: err.message || "Cập nhật thất bại!",
    };
    res.redirect("/account/edit");
  }
};

exports.getChangePasswordPage = (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  res.render("client/account/change-password", {
    layout: "main",
    title: "Đổi mật khẩu",
  });
};

exports.postChangePassword = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const id = req.session.customer.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!oldPassword || !newPassword || !confirmPassword) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      };
      return res.redirect("/account/change-password");
    }

    if (newPassword !== confirmPassword) {
      req.session.toastr = {
        type: "error",
        message: "Mật khẩu mới không khớp",
      };
      return res.redirect("/account/change-password");
    }

    await accountService.changePassword(id, { oldPassword, newPassword });

    req.session.toastr = {
      type: "success",
      message: "Đổi mật khẩu thành công!",
    };
    res.redirect("/account");
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err.message);
    req.session.toastr = {
      type: "error",
      message: err.message || "Đổi mật khẩu thất bại!",
    };
    res.redirect("/account/change-password");
  }
};
