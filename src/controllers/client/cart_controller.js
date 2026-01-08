const cartService = require("../../services/client/cart_service.js");
exports.getCartPage = async (req, res) => {
  try {
    // Check if customer is logged in
    if (!req.session.customer) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng đăng nhập để xem giỏ hàng",
      };
      return res.redirect("/account/login");
    }

    const cus_id = req.session.customer.id;
    const cartItems = await cartService.getAllProducts(cus_id);
    res.render("client/cart/list", {
      layout: "main",
      cartItems: cartItems.products,
      grandTotal: cartItems.grandTotal,
      title: "Giỏ hàng",
    });
  } catch (error) {
    console.error("Error getting cart page:", error);
    res.status(500).send("Lỗi server: " + error.message);
  }
};

exports.addToCart = async (req, res) => {
  try {
    if (!req.session.customer) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để thêm vào giỏ hàng",
      });
    }

    const { book_id } = req.body;
    const cus_id = req.session.customer.id;

    // Add to cart
    await cartService.addToCart(cus_id, book_id);
    res.json({
      success: true,
      message: "Thêm vào giỏ hàng thành công",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra",
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    if (!req.session.customer) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const cus_id = req.session.customer.id;
    const { book_id, action } = req.body;

    const result = await cartService.updateCartItem(cus_id, book_id, action);

    if (!result.success) {
      return res.json(result);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error update cart item:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

exports.removeCartItem = async (req, res) => {
  if (!req.session.customer) {
    req.session.toastr = {
      type: "error",
      message: "Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng",
    };
    return res.redirect("/account/login");
  }

  const { book_id } = req.body;
  const cus_id = req.session.customer.id;

  await cartService.removeCartItem(cus_id, book_id);

  req.session.toastr = {
    type: "success",
    message: "Xóa sản phẩm khỏi giỏ hàng thành công",
  };
  return res.redirect("/cart");
};
