const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/product_controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Multer configuration ────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(__dirname, "../../public/img/products");
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_ERROR_MSG =
  "Chỉ chấp nhận ảnh JPEG, PNG, WebP và dung lượng không vượt quá 5MB.";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    // Track generated filename so we can clean up a partial file on size-limit errors
    req._pendingFilename = unique;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass error string code; actual message shown via UPLOAD_ERROR_MSG
    cb(new Error("INVALID_FILE_TYPE"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// ─── Upload error-handling wrapper ──────────────────────────────────────────
// getRedirectPath: string path OR function (req) => string
// Catches both MulterError (LIMIT_FILE_SIZE) and fileFilter rejections.
// Also removes any partial file that diskStorage may have written before
// a size-limit abort fires.
function handleUpload(getRedirectPath) {
  return (req, res, next) => {
    upload.single("image_path")(req, res, (err) => {
      if (!err) return next();

      // Remove partial file left on disk when size limit is hit mid-stream
      const partialPath =
        (req.file && req.file.path) ||
        (req._pendingFilename && path.join(UPLOAD_DIR, req._pendingFilename));
      if (partialPath) {
        fs.unlink(partialPath, () => {});
      }

      req.session.toastr = { type: "error", message: UPLOAD_ERROR_MSG };
      const target =
        typeof getRedirectPath === "function"
          ? getRedirectPath(req)
          : getRedirectPath;
      return res.redirect(target);
    });
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Hiển thị danh sách sản phẩm
router.get("/", productController.list);

// Hiển thị form thêm sản phẩm
router.get("/add", productController.showAddForm);

// Xử lý thêm sản phẩm
router.post(
  "/add",
  handleUpload("/admin/products/add"),
  productController.add
);

// Hiển thị form sửa sản phẩm
router.get("/:id/edit", productController.showEditForm);

// Cập nhật sản phẩm
router.patch(
  "/:id",
  handleUpload((req) => `/admin/products/${req.params.id}/edit`),
  productController.edit
);

// Hiển thị chi tiết sản phẩm
router.get("/:id", productController.getProductById);

// Cập nhật trạng thái sản phẩm (khóa/mở khóa)
router.patch("/:id/status", productController.toggleStatus);

// Xóa sản phẩm
// router.delete('/:id', productController.delete);

module.exports = router;
