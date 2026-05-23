const bookService = require("../../services/admin/product_service");
const publisherService = require("../../services/admin/publisher_service");
const importService = require("../../services/admin/import_service");

exports.listImports = async (req, res) => {
  try {
    const { status } = req.query;
    const user = req.session.user;
    const statusFilter = (status !== undefined && status !== "") ? parseInt(status) : null;

    const imports = await importService.getAllImports({
      statusFilter,
      userId: user.id,
      role: user.role,
    });

    res.render("admin/imports/list", {
      layout: "main-admin",
      title: "Danh sách phiếu nhập",
      imports,
      selectedStatus: status !== undefined ? String(status) : "",
    });
  } catch (error) {
    console.error("Error listing imports:", error);
    req.session.toastr = { type: "error", message: "Lỗi khi tải danh sách nhập sách" };
    res.redirect("/admin");
  }
};

exports.showImportForm = async (req, res) => {
  const publisherId = req.query.publisher || null;
  try {
    let books = [];
    if (publisherId) {
      books = await bookService.getAll({ publisherId });
    }
    res.render("admin/imports/import", {
      layout: "main-admin",
      title: "Tạo phiếu nhập",
      books,
      publishers: await publisherService.getAll({ status: 1 }),
      selectedPublisherId: publisherId,
      hasPublisher: !!publisherId,
    });
  } catch (error) {
    console.error("Error displaying import page:", error);
    req.session.toastr = { type: "error", message: "Lỗi khi tải trang nhập sách" };
    res.redirect("/admin");
  }
};

// Render trang chi tiết (SSR) thay vì trả JSON
exports.getImportById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.session.user;
    const importData = await importService.getImportDetails(id);
    if (!importData) {
      req.session.toastr = { type: "error", message: "Phiếu nhập không tồn tại" };
      return res.redirect("/admin/imports");
    }
    const canManage = ["manager", "admin"].includes(user.role);

    res.render("admin/imports/detail", {
      layout: "main-admin",
      title: `Chi tiết phiếu nhập #${id}`,
      importHeader: importData.header,
      importDetails: importData.details,
      total_quantity: importData.total_quantity,
      total_cost: importData.total_cost,
      userRole: user.role,
      canManage,
    });
  } catch (error) {
    console.error("Error fetching import details:", error);
    req.session.toastr = { type: "error", message: "Lỗi khi tải thông tin phiếu nhập" };
    res.redirect("/admin/imports");
  }
};

exports.addImport = async (req, res) => {
  try {
    const { publisher_id, books } = req.body;
    if (!publisher_id || !books || Object.keys(books).length === 0) {
      req.session.toastr = { type: "error", message: "Vui lòng chọn nhà xuất bản và sách cần nhập" };
      return res.redirect("/admin/imports/new");
    }
    const importId = await importService.addImport({
      publisher_id,
      books: Object.values(books),
      created_by: req.session.user.id,
    });
    req.session.toastr = { type: "success", message: "Tạo phiếu nháp thành công" };
    res.redirect(`/admin/imports/${importId}`);
  } catch (error) {
    console.error("Error adding import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi server" };
    res.redirect("/admin/imports/new");
  }
};

exports.submitImport = async (req, res) => {
  const importId = req.params.id;
  try {
    await importService.submitImport(importId, req.session.user.id);
    req.session.toastr = { type: "success", message: "Gửi duyệt thành công" };
  } catch (error) {
    console.error("Error submitting import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi gửi duyệt" };
  }
  res.redirect(`/admin/imports/${importId}`);
};

exports.recallImport = async (req, res) => {
  const importId = req.params.id;
  try {
    await importService.recallImport(importId, req.session.user.id);
    req.session.toastr = { type: "success", message: "Hủy gửi duyệt thành công" };
  } catch (error) {
    console.error("Error recalling import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi hủy gửi duyệt" };
  }
  res.redirect(`/admin/imports/${importId}`);
};

exports.approveImport = async (req, res) => {
  const importId = req.params.id;
  try {
    await importService.approveImport(importId, req.session.user.id);
    req.session.toastr = { type: "success", message: "Duyệt phiếu nhập thành công. Tồn kho đã được cập nhật." };
  } catch (error) {
    console.error("Error approving import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi duyệt phiếu" };
  }
  res.redirect(`/admin/imports/${importId}`);
};

exports.rejectImport = async (req, res) => {
  const importId = req.params.id;
  const { reject_reason } = req.body;
  try {
    await importService.rejectImport(importId, reject_reason);
    req.session.toastr = { type: "success", message: "Đã từ chối phiếu nhập" };
  } catch (error) {
    console.error("Error rejecting import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi từ chối phiếu" };
  }
  res.redirect(`/admin/imports/${importId}`);
};

exports.deleteImport = async (req, res) => {
  const importId = req.params.id;
  try {
    await importService.deleteImport(importId, req.session.user.id, req.session.user.role);
    req.session.toastr = { type: "success", message: "Xóa phiếu nhập thành công" };
    res.redirect("/admin/imports");
  } catch (error) {
    console.error("Error deleting import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi xóa phiếu" };
    res.redirect(`/admin/imports/${importId}`);
  }
};

exports.showEditForm = async (req, res) => {
  const importId = req.params.id;
  try {
    const publisherOverride = req.query.publisher || null;
    const data = await importService.getImportForEdit(
      importId,
      req.session.user.id,
      publisherOverride
    );
    const publishers = await publisherService.getAll({ status: 1 });

    res.render("admin/imports/edit", {
      layout: "main-admin",
      title: `Chỉnh sửa phiếu nhập #${importId}`,
      importHeader: data.importHeader,
      books: data.books,
      activePublisherId: data.activePublisherId,
      publishers,
    });
  } catch (error) {
    console.error("Error loading edit form:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi tải form chỉnh sửa" };
    res.redirect(`/admin/imports/${importId}`);
  }
};

exports.updateImport = async (req, res) => {
  const importId = req.params.id;
  try {
    const { books, publisher_id } = req.body;

    // ★ Controller Validation: Ép kiểu và lọc sạch payload
    // Dùng Object.values + data.book_id (hidden field) thay vì key, tránh lỗi qs compact array
    const booksArray = books
      ? Object.values(books)
          .map((data) => ({
            book_id: parseInt(data.book_id, 10),
            quantity: parseInt(data.quantity, 10),
            import_price: parseFloat(data.import_price),
          }))
          .filter((b) =>
            Number.isInteger(b.book_id) && b.book_id > 0 &&
            Number.isInteger(b.quantity) && b.quantity > 0 &&
            !Number.isNaN(b.import_price) && b.import_price > 0
          )
      : [];

    if (booksArray.length === 0) {
      req.session.toastr = { type: "error", message: "Phiếu nhập phải có ít nhất một sách hợp lệ" };
      return res.redirect(`/admin/imports/${importId}/edit`);
    }

    await importService.updateImport(importId, req.session.user.id, booksArray, publisher_id);
    req.session.toastr = { type: "success", message: "Cập nhật phiếu nhập thành công!" };
    res.redirect(`/admin/imports/${importId}`);
  } catch (error) {
    console.error("Error updating import:", error);
    req.session.toastr = { type: "error", message: error.message || "Lỗi khi cập nhật phiếu nhập" };
    res.redirect(`/admin/imports/${importId}/edit`);
  }
};
