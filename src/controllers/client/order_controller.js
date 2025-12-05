const orderService = require("../../services/client/order_service.js");

exports.getOrdersPage = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/account/login");
  }
  const id = req.session.customer.id;
  const filter = req.query.filter || "";

  try {
    const orders = await orderService.getCustomerOrders(id, filter);
    let title = "Tất cả đơn hàng";
    if (filter === "waiting") title = "Chờ xác nhận";
    else if (filter === "preparing") title = "Đang chuẩn bị hàng";
    else if (filter === "delivering") title = "Đang giao";
    else if (filter === "delivered") title = "Đã giao";
    else if (filter === "cancelled") title = "Bị hủy";

    res.render("client/account/orders", {
      layout: "main",
      orders,
      filter,
      title,
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
    const orderData = await accountService.getOrderDetails(cus_id, order_id);
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
    return res.status(401).json({ error: "Unauthorized" });
  }
  const cus_id = req.session.customer.id;
  const order_id = req.params.id;

  try {
    await orderService.cancelOrder(cus_id, order_id);
    res.json({ success: true, message: "Hủy đơn hàng thành công" });
  } catch (err) {
    console.error("Lỗi hủy đơn hàng:", err.message);
    res.status(400).json({ error: err.message });
  }
};
