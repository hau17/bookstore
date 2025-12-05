const homeService = require("../../services/admin/home_service.js");

exports.getLoginPage = (req, res) => {
  res.render("admin/login", { layout: "login" });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Kiểm tra input
    if (!email || !password) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng nhập đầy đủ email và mật khẩu",
      };
      return res.redirect("/admin/login");
    }

    // 2. Gọi service để kiểm tra đăng nhập
    const user = await homeService.authenticateUser(email, password);

    // 3. Lưu thông tin vào session
    req.session.user = {
      id: user.user_id,
      email: user.email,
      role: user.role,
    };

    // 4. Toastr thông báo
    req.session.toastr = {
      type: "success",
      message: "Đăng nhập thành công!",
    };

    return res.redirect("/admin");
  } catch (err) {
    console.error("Lỗi đăng nhập:", err.message);

    // Service throw Error → hiển thị cho người dùng
    req.session.toastr = {
      type: "error",
      message: err.message || "Email hoặc mật khẩu không đúng!",
    };

    return res.redirect("/admin/login");
  }
};

//logout
exports.logout = (req, res) => {
  // Destroy session and redirect on completion. Also clear the session cookie.
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session during logout:", err);
      // If destroy failed, try clearing cookie anyway and send user to admin home
      try {
        res.clearCookie("connect.sid");
      } catch (e) {
        // ignore
      }
      return res.redirect("/admin");
    }

    // On successful destroy, clear cookie and redirect to login
    res.clearCookie("connect.sid");
    return res.redirect("/admin/login");
  });
};

exports.getDashboard = (req, res) => {
  res.render("admin/home", { layout: "main-admin" });
};
