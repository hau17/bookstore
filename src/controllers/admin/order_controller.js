const orderService = require("../../services/admin/order_service");

exports.list = async (req, res) => {
  try {
    const status = req.query.status || "";
    const orders = await orderService.getAll({ status });
    const statuses = await orderService.getAllStatuses();

    let title = "Tất cả đơn hàng";

    res.render("admin/orders/list", {
      layout: "main-admin",
      title,
      orders,
      statuses,
      status,
    });
  } catch (error) {
    console.error("Error listing orders:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách đơn hàng",
    };
    res.redirect("/admin");
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateStatus = async (req, res) => {
  try {
    const order_id = req.params.id;
    const { status_id } = req.body;

    if (!order_id || !status_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu order_id hoặc status_id",
      });
    }

    const affectedRows = await orderService.updateStatus(order_id, status_id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại",
      });
    }

    return res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Cập nhật trạng thái đơn hàng thất bại",
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const order_id = req.params.id;
    const { payment_status } = req.body;

    if (!order_id || payment_status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu order_id hoặc payment_status",
      });
    }

    const affectedRows = await orderService.updatePaymentStatus(
      order_id,
      payment_status
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại",
      });
    }

    return res.json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Cập nhật trạng thái thanh toán thất bại",
    });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const details = await orderService.getOrderDetails(orderId);
    return res.json({ success: true, data: details });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tải thông tin đơn hàng",
    });
  }
};
