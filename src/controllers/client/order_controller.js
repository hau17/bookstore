const orderService = require("../../services/client/order_service.js");

exports.getOrdersPage = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const cus_id = req.session.customer.id;
  const order_status = req.query.order_status || "";

  try {
    const orders = await orderService.getCustomerOrders({
      cus_id,
      order_status,
    });

    res.render("client/account/orders", {
      layout: "main",
      orders,
      order_status,
      title: "Đơn hàng của tôi",
    });
  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).send("Lỗi server");
  }
};

exports.getOrderDetailsPage = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const cus_id = req.session.customer.id;
  const order_id = req.params.id;
  try {
    const orderData = await orderService.getOrderDetails({ cus_id, order_id });
    res.render("client/account/order-detail", {
      layout: "main",
      order: orderData.order,
      items: orderData.items,
      history: orderData.history,
      title: `Đơn hàng #${order_id}`,
    });
  } catch (err) {
    console.error("Lỗi:", err.message);
    req.session.toastr = {
      type: "error",
      message: "Không thể tải đơn hàng",
    };
    res.redirect("/account/orders");
  }
};

exports.postCancelOrder = async (req, res) => {
  if (!req.session.customer) {
    req.session.toastr = {
      type: "error",
      message: "Vui lòng đăng nhập để hủy đơn hàng",
    };
    return res.redirect("/account/login");
  }
  const cus_id = req.session.customer.id;
  const order_id = req.params.id;

  try {
    await orderService.cancelOrder({ cus_id, order_id });
    req.session.toastr = {
      type: "success",
      message: "Hủy đơn hàng thành công",
    };
    res.redirect("/account/orders");
  } catch (err) {
    console.error("Lỗi hủy đơn hàng:", err.message);
    req.session.toastr = {
      type: "error",
      message: "Không thể hủy đơn hàng",
    };
    res.redirect("/account/orders");
  }
};
