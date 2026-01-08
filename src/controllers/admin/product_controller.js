const productService = require("../../services/admin/product_service.js");
const categoryService = require("../../services/admin/category_service.js");
const authorService = require("../../services/admin/author_service.js");
const publisherService = require("../../services/admin/publisher_service.js");
const fs = require("fs");
const path = require("path");

exports.list = async (req, res) => {
  try {
    const status = req.query.status || "";
    const products = await productService.getAll({
      status: status || undefined,
    });
    let title = "Tất cả sản phẩm";
    res.render("admin/products/list", {
      layout: "main-admin",
      title,
      products,
      status: status,
    });
  } catch (error) {
    console.error("Error listing products:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách sản phẩm",
    };
    res.redirect("/admin");
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      req.session.toastr = {
        type: "error",
        message: "Sản phẩm không tồn tại",
      };
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.error(err);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi lấy thông tin sản phẩm",
    };
    res.redirect("/admin/products");
  }
};

exports.showAddForm = async (req, res) => {
  try {
    const categories = await categoryService.getAll({ status: "1" });
    const authors = await authorService.getAll({ status: "1" });
    const publishers = await publisherService.getAll({ status: "1" });
    res.render("admin/products/add", {
      layout: "main-admin",
      title: "Thêm sản phẩm",
      categories: categories,
      authors: authors,
      publishers: publishers,
    });
  } catch (error) {
    console.error("Error showing add form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải form thêm sản phẩm",
    };
    res.redirect("/admin/products");
  }
};

exports.add = async (req, res) => {
  try {
    const {
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      profit_percentage,
      stock_quantity,
      description,
    } = req.body;

    if (
      !book_title ||
      !category_id ||
      !author_id ||
      !publisher_id ||
      !profit_percentage
    ) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng điền đầy đủ các trường bắt buộc",
      };
      return res.redirect("/admin/products");
    }
    const image_path = req.file ? "/img/products/" + req.file.filename : null;
    const product = {
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      profit_percentage,
      stock_quantity,
      description,
      image_path,
    };

    await productService.add(product);
    req.session.toastr = {
      type: "success",
      message: "Thêm sản phẩm thành công",
    };
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error adding product:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi thêm sản phẩm: " + error.message,
    };
    res.redirect("/admin/products");
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      req.session.toastr = {
        type: "error",
        message: "Sản phẩm không tồn tại",
      };
      return res.redirect("/admin/products");
    }
    const categories = await categoryService.getAll({ status: "1" });
    const authors = await authorService.getAll({ status: "1" });
    const publishers = await publisherService.getAll({ status: "1" });
    res.render("admin/products/edit", {
      layout: "main-admin",
      title: "Sửa sản phẩm",
      product,
      categories,
      authors,
      publishers,
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải form sửa sản phẩm",
    };
    res.redirect("/admin/products");
  }
};

exports.edit = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      profit_percentage,
      description,
    } = req.body;

    if (
      !book_title ||
      !category_id ||
      !author_id ||
      !publisher_id ||
      !profit_percentage
    ) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng điền đầy đủ các trường bắt buộc",
      };
      return res.redirect(`/admin/products/${productId}/edit`);
    }

    const oldProduct = await productService.getProductById(productId);
    if (!oldProduct) {
      req.session.toastr = {
        type: "error",
        message: "Sản phẩm không tồn tại",
      };
      return res.redirect("/admin/products");
    }

    let image_path = oldProduct.image_path;

    if (req.file) {
      image_path = "/img/products/" + req.file.filename;

      if (oldProduct.image_path) {
        const oldImageFullPath = path.join(
          __dirname,
          "../../public",
          oldProduct.image_path
        );

        // Kiểm tra file tồn tại trước khi xóa
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      }
    }

    const product = {
      book_id: productId,
      book_title,
      category_id,
      author_id,
      publisher_id,
      discount_percentage,
      profit_percentage,
      description,
      image_path,
    };

    await productService.update(product);

    req.session.toastr = {
      type: "success",
      message: "Cập nhật sản phẩm thành công",
    };
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật sản phẩm",
    };
    res.redirect("/admin/products");
  }
};

// Cập nhật trạng thái (khóa/mở khóa)
exports.toggleStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await productService.toggleStatus(productId);
    if (result.affectedRows === 0) {
      req.session.toastr = {
        type: "error",
        message: "Sản phẩm không tồn tại",
      };
      return res.redirect("/admin/products");
    }
    req.session.toastr = {
      type: "success",
      message: "Trạng thái sản phẩm đã được cập nhật",
    };
    res.redirect("/admin/products");
    // res.status(200).json({ message: 'Trạng thái sản phẩm đã được cập nhật' });
  } catch (error) {
    console.error("Error toggling product status:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi cập nhật trạng thái sản phẩm: " + error.message,
    };
    res.redirect("/admin/products");
  }
};
