const db = require("../../config/db.js");
const checkoutService = require("../../services/client/checkout_service.js");
const cartService = require("../../services/client/cart_service.js");
const account_service = require("../../services/client/account_service.js");
const productService = require("../../services/client/product_service.js");
exports.getCheckoutCartPage = async (req, res) => {
  try {
    const customerId = req.session.customer.id;
    const { products, grandTotal } = await cartService.getAllProducts(
      customerId
    );
    const customer = await account_service.getCustomerById(customerId);
    res.render("client/checkout/main", {
      title: "Thanh toán giỏ hàng",
      products,
      grandTotal,
      customer,
      mode: "cart",
    });
  } catch (err) {
    console.error("Lỗi hiển thị trang thanh toán:", err.message);
    req.session.toastr = {
      type: "error",
      message: "Lỗi: " + err.message,
    };
    res.redirect("/cart");
  }
};
exports.postCheckoutCart = async (req, res) => {
  try {
    const customerId = req.session.customer.id;
    const { address, phoneNumber, paymentId } = req.body;
    if (!address || !phoneNumber) {
      return res.status(400).send("Thiếu thông tin giao hàng");
    }

    const orderId = await checkoutService.checkoutItems(
      customerId,
      address,
      phoneNumber,
      paymentId
    );
    if (paymentId == 2) {
      return res.redirect(`/checkout/qr?orderId=${orderId}`);
    }

    req.session.toastr = { type: "success", message: "Đặt hàng thành công!" };
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", error.message);
    req.session.toastr = {
      type: "error",
      message: "Lỗi: " + error.message,
    };
    res.redirect("/cart");
  }
};

exports.getBuyNowPage = async (req, res) => {
  try {
    const bookId = req.params.id;
    const customerId = req.session.customer.id;
    const quantity = 1;
    const product = await productService.getProductById(bookId);

    if (!product) {
      return res.status(404).send("Sản phẩm không tồn tại");
    }
    product.quantity = quantity;
    const customer = await account_service.getCustomerById(customerId);
    //tính tổng tiền
    const grandTotal = product.selling_price * quantity;
    res.render("client/checkout/main", {
      title: "Mua hàng",
      products: [product],
      grandTotal,
      customer,
      mode: "buy-now",
    });
  } catch (err) {
    console.error("Lỗi hiển thị trang mua ngay:", err.message);
    req.session.toastr = {
      type: "error",
      message: "Lỗi: " + err.message,
    };
    res.redirect("/");
  }
};

exports.postBuyNow = async (req, res) => {
  try {
    const bookId = req.params.id;
    const customerId = req.session.customer.id;

    // Validate & chuẩn hóa input
    const quantity = parseInt(req.body.quantity, 10) || 1;
    const address = (req.body.address || "").trim();
    const phoneNumber = (req.body.phoneNumber || "").trim();
    const paymentId = Number(req.body.paymentId) || 1; // default = 1 (COD)

    if (!address || !phoneNumber) {
      return res.status(400).send("Thiếu thông tin giao hàng");
    }

    const orderId = await checkoutService.buyNow(
      customerId,
      bookId,
      quantity,
      address,
      phoneNumber,
      paymentId
    );

    if (paymentId === 2) {
      return res.redirect(`/checkout/qr?orderId=${orderId}`);
    }

    req.session.toastr = { type: "success", message: "Đặt hàng thành công!" };
    res.redirect("/account/orders");
  } catch (error) {
    console.error("Lỗi khi xử lý mua ngay:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi: " + error.message,
    };
    res.redirect("/");
  }
};

//trang qr thanh toán
exports.getQRCodePage = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!orderId) return res.status(400).send("Thiếu orderId");

    const qrImg = await checkoutService.generatePaymentQRCode(orderId);
    res.render("client/checkout/qr", { qrImg, orderId });
  } catch (error) {
    console.error("Lỗi khi hiển thị QR code:", error.message);
    req.session.toastr = {
      type: "error",
      message: "Lỗi: " + error.message,
    };
    res.redirect("/cart");
  }
};
