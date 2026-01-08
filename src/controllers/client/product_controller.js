const productService = require("../../services/client/product_service");
const categoryService = require("../../services/admin/category_service");

exports.getAllProducts = async (req, res) => {
  try {
    const { products, pagination } =
      await productService.getProductsWithPagination(req.query);

    const categories = await categoryService.getAll({ status: 1 });

    res.render("client/products/list", {
      title: "Sản phẩm",
      products,
      categories,
      selectedCategoryId: req.query.category || "",
      search: req.query.search || "",
      ...pagination,
    });
  } catch (error) {
    console.error(error);
    req.session.toastr = {
      type: "error",
      message: "Có lỗi xảy ra khi tải danh sách sản phẩm",
    };
    res.redirect("/");
  }
};

exports.getProductPage = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      req.session.toastr = {
        type: "error",
        message: "Sản phẩm không tồn tại",
      };
      return res.redirect("/products");
    }

    res.render("client/products/detail", { product });
  } catch (error) {
    console.error(error);
    req.session.toastr = {
      type: "error",
      message: "Có lỗi xảy ra khi tải trang sản phẩm",
    };
    res.redirect("/products");
  }
};
