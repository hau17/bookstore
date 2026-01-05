const customerService = require("../../services/admin/customer_service");

exports.list = async (req, res) => {
  const status = req.query.status || "";
  try {
    const customers = await customerService.getAll({ status });
    res.render("admin/customers/list", {
      customers,
      layout: "main-admin",
      title: "Quản lý khách hàng",
      status,
    });
  } catch (error) {
    console.error("Error fetching customer list:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách khách hàng",
    };
    res.redirect("/admin");
  }
};

exports.getCustomerById = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      req.session.toastr = {
        type: "error",
        message: "Khách hàng không tồn tại",
      };
      return res.redirect("/admin/customers");
    }
    res.render("admin/customers/detail", {
      customer,
      layout: "main-admin",
      title: "Chi tiết khách hàng",
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải thông tin khách hàng",
    };
    res.redirect("/admin/customers");
  }
};
exports.lockCustomer = async (req, res) => {
  const customerId = req.params.id;
  try {
    await customerService.lockCustomer(customerId);
    req.session.toastr = {
      type: "success",
      message: "Khóa khách hàng thành công",
    };
    res.redirect("/admin/customers");
  } catch (error) {
    console.error("Error locking customer:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi khóa khách hàng",
    };
    res.redirect("/admin/customers");
  }
};
