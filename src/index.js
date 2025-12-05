// ==========================
// 📦 1. Import thư viện
// ==========================
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const { engine } = require("express-handlebars");

const hbsHelpers = require("./helpers/handlebars.js");

const app = express();
const port = 3000;

// ==========================
// ⚙️ 2. Middleware cơ bản
// ==========================

// ✅ Dùng để đọc dữ liệu từ form (req.body)
app.use(express.urlencoded({ extended: true }));

// ✅ Dùng để parse JSON (trường hợp gửi API)
app.use(express.json());

// ✅ Cho phép dùng PUT, DELETE từ form (vì HTML form chỉ có GET & POST)
app.use(methodOverride("_method"));

// ==========================
// 🔐 3. Session & toarst message
// ==========================

// Cấu hình session (phải có trước flash)
app.use(
  session({
    secret: "secret-key-17082004", // bí mật để mã hóa session ID
    resave: false, // không lưu lại session nếu không thay đổi
    saveUninitialized: false, // không tạo session khi chưa dùng
    cookie: { maxAge: 1000 * 60 * 60 }, // thời hạn cookie = 1h
  })
);

// ✅ Gắn biến flash vào res.locals để view nào cũng dùng được
app.use((req, res, next) => {
  res.locals.toastr = req.session.toastr; // đưa từ session → locals
  delete req.session.toastr; // xóa ở session để chỉ hiển thị 1 lần
  next();
});

// Make session user available in all templates (used by sidebar role checks)
app.use((req, res, next) => {
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  res.locals.customer =
    req.session && req.session.customer ? req.session.customer : null;
  next();
});

// ==========================
// 🧱 4. Template Engine (Handlebars)
// ==========================
app.engine(
  ".hbs",
  engine({
    extname: ".hbs", // đuôi file template
    defaultLayout: "main", // layout mặc định
    helpers: hbsHelpers, // hàm helper tùy chỉnh
    layoutsDir: path.join(__dirname, "resources/views/layouts"), // thư mục layout
    partialsDir: path.join(__dirname, "resources/views/partials"), // thư mục partial
  })
);

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "resources/views"));

// ==========================
// 🚏 5. Routes
// ==========================

// Import các router riêng
const adminRouter = require("./routers/admin/home_router.js");
const clientRouter = require("./routers/client/home_router.js");

// Đăng ký route nhóm
app.use("/admin", adminRouter);
app.use("/", clientRouter);

// Trang chủ
app.get("/", (req, res) => {
  res.render("home", { title: "Trang chủ" });
});

// ==========================
// 📁 6. Static files (CSS, JS, Images)
// ==========================
// ✅ Phải đặt SAU routes nếu có đường dẫn trùng (vd: /admin/css)
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// 🚀 7. Khởi động server
// ==========================
app.listen(port, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${port}`);
});
