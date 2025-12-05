const customerService = require("../../services/admin/customer_service");

exports.list = async (req, res) => {
  try {
    const customers = await customerService.getAll();
    res.render("admin/customers/list", {
      customers,
      layout: "main-admin",
      title: "Quản lý khách hàng",
    });
  } catch (error) {
    console.error("Error fetching customer list:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getCustomerById = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).send("Customer not found");
    }
    res.render("admin/customers/detail", {
      customer,
      layout: "main-admin",
      title: "Chi tiết khách hàng",
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
  }
};
