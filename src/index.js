// ==========================
// 📦 1. Import thư viện
// ==========================
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const { engine } = require('express-handlebars');

const hbsHelpers = require('./helpers/handlebars.js');

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
app.use(methodOverride('_method'));


// ==========================
// 🔐 3. Session & Flash message
// ==========================

// Cấu hình session (phải có trước flash)
app.use(session({
  secret: "secret-key-17082004", // bí mật để mã hóa session ID
  resave: false,                 // không lưu lại session nếu không thay đổi
  saveUninitialized: false,      // không tạo session khi chưa dùng
  cookie: { maxAge: 1000 * 60 * 60 } // thời hạn cookie = 1h
}));

// Cấu hình flash (dùng để gửi thông báo tạm thời)
app.use(flash());

// ✅ Gắn biến flash vào res.locals để view nào cũng dùng được
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


// ==========================
// 🧱 4. Template Engine (Handlebars)
// ==========================
app.engine('.hbs', engine({
  extname: '.hbs', // đuôi file template
  defaultLayout: 'main', // layout mặc định
  helpers: hbsHelpers, // hàm helper tùy chỉnh
  layoutsDir: path.join(__dirname, 'resources/views/layouts'), // thư mục layout
  partialsDir: path.join(__dirname, 'resources/views/partials') // thư mục partial
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resources/views'));


// ==========================
// 🚏 5. Routes
// ==========================

// Import các router riêng
const adminRouter = require('./routers/admin/home_router.js');
const productRouter = require('./routers/client/product_router.js');

// Đăng ký route nhóm
app.use('/admin', adminRouter);
app.use('/products', productRouter);

// Trang chủ
app.get('/', (req, res) => {
  res.render('home', { title: 'Trang chủ' });
});


// ==========================
// 📁 6. Static files (CSS, JS, Images)
// ==========================
// ✅ Phải đặt SAU routes nếu có đường dẫn trùng (vd: /admin/css)
app.use(express.static(path.join(__dirname, 'public')));


// ==========================
// 🚀 7. Khởi động server
// ==========================
app.listen(port, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${port}`);
});

// const express = require('express');
// const session = require('express-session');
// const flash = require('connect-flash');
// const path = require('path');
// const app = express();
// const port = 3000;
// methodOverride = require('method-override')
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// //session
// app.use(
//   session({
//     secret: "secret-key-17082004",
//     cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour`
//     saveUninitialized: false,
//     resave: false,
//   })
// );


// app.use(flash());
// app.use((req, res, next) => {
//   res.locals.success = req.flash('success');
//   res.locals.error = req.flash('error');
//   next();
// });
// // Cấu hình method-override
// const { engine } = require('express-handlebars');

// const hbsHelpers = require('./helpers/handlebars.js');
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'))
// // Cấu hình Handlebars

// app.engine('.hbs', engine({ extname: '.hbs', 
//   defaultLayout: 'main' , 
//   helpers: hbsHelpers, 
//   layoutsDir: path.join(__dirname, 'resources/views/layouts'),
//   partialsDir: path.join(__dirname, 'resources/views/partials')
//  }));
// app.set('view engine', '.hbs');
// app.set('views', path.join(__dirname, 'resources/views'));

// // Routers
// const adminRouter = require('./routers/admin/home_router.js');
// const productRouter = require('./routers/client/product_router.js');

// // Gắn routers trước middleware tĩnh
// app.use('/admin', adminRouter);
// app.use('/products', productRouter);

// // Middleware tĩnh
// app.use(express.static(path.join(__dirname, 'public')));

// // Route chính
// app.get('/', (req, res) => {
//   res.render('home');
// });


// // Khởi động server
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });