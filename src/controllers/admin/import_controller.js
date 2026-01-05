const bookService = require("../../services/admin/product_service");
const publisherService = require("../../services/admin/publisher_service");
const importService = require("../../services/admin/import_service");

// Show imports history (list)
exports.listImports = async (req, res) => {
  try {
    const imports = await importService.getAllImports();
    res.render("admin/imports/list", {
      layout: "main-admin",
      title: "Lịch sử nhập sách",
      imports,
    });
  } catch (error) {
    console.error("Error listing imports:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải danh sách nhập sách",
    };
    res.redirect("/admin");
  }
};

// Show import form (select books to import)
exports.showImportForm = async (req, res) => {
  const publisherId = req.query.publisher || null;

  try {
    let books = [];
    if (publisherId) {
      books = await bookService.getAll({
        status: 1,
        publisherId: publisherId,
      });
    }
    res.render("admin/imports/import", {
      layout: "main-admin",
      title: "Nhập sách",
      books, // rỗng nếu chưa chọn NXB
      publishers: await publisherService.getAll({ status: 1 }),
      selectedPublisherId: publisherId,
      hasPublisher: !!publisherId,
    });
  } catch (error) {
    console.error("Error displaying import page:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải trang nhập sách",
    };
    res.redirect("/admin");
  }
};

// Return import details as JSON for modal
exports.getImportById = async (req, res) => {
  try {
    const id = req.params.id;
    const importData = await importService.getImportDetails(id);
    if (!importData) {
      req.session.toastr = {
        type: "error",
        message: "Phiếu nhập không tồn tại",
      };
      return res.status(404).json({ error: "Import not found" });
    }
    res.json(importData);
  } catch (error) {
    console.error("Error fetching import details:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi khi tải thông tin phiếu nhập",
    };
    res.redirect("/admin/imports");
  }
};

exports.addImport = async (req, res) => {
  try {
    const { publisher_id, books } = req.body;
    if (!publisher_id || !books || Object.keys(books).length === 0) {
      req.session.toastr = {
        type: "error",
        message: "Vui lòng chọn nhà xuất bản và sách cần nhập",
      };
      return res.redirect("/admin/imports/new");
    }
    const importId = await importService.addImport({
      publisher_id,
      books: Object.values(books),
    });
    req.session.toastr = {
      type: "success",
      message: "Nhập sách thành công",
    };
    res.redirect("/admin/imports");
  } catch (error) {
    console.error("Error adding import:", error);
    req.session.toastr = {
      type: "error",
      message: "Lỗi server",
    };
    res.redirect("/admin/imports");
  }
};
