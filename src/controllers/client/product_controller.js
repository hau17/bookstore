const productService = require("../../services/client/product_service.js");
const categoryService = require("../../services/admin/category_service.js");

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const { products, total } = await productService.getProductsWithLimit({
      category: category || undefined,
      search: search || undefined,
      page,
      limit,
    });

    // Lấy danh sách categories để hiển thị bộ lọc
    const categories = await categoryService.getAll();

    // Tính toán pagination
    const totalPages = Math.ceil(total / limit);
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    res.render("client/products/list", {
      title: "Sản phẩm",
      products,
      page,
      search,
      categories,
      selectedCategoryId: category,
      hasPrev,
      hasNext,
      prevPage: page - 1,
      nextPage: page + 1,
      totalPages,
      total,
    });
  } catch (error) {
    res.status(500).send("Lỗi server nha: " + error.message);
  }
};

exports.getProductPage = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).send("Sản phẩm không tồn tại");
    }
    res.render("client/products/detail", { product });
  } catch (error) {
    res.status(500).send("Lỗi server nha: " + error.message);
  }
};
