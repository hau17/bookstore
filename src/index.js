const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;
methodOverride = require('method-override')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//session
app.use(
  session({
    secret: "secret-key-17082004",
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour`
    saveUninitialized: false,
    resave: false,
  })
);
app.use((req, res, next) => {
  // console.log('Session ID:', req.sessionID);
  // console.log('Session user:', req.session.user);
  next();
});
// Cấu hình method-override
const { engine } = require('express-handlebars');

const hbsHelpers = require('./helpers/handlebars.js');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
// Cấu hình Handlebars

app.engine('.hbs', engine({ extname: '.hbs', defaultLayout: 'main' , helpers: hbsHelpers }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// Routers
const adminRouter = require('./routers/admin/home_router.js');
const productRouter = require('./routers/client/product_router.js');

// Gắn routers trước middleware tĩnh
app.use('/admin', adminRouter);
app.use('/products', productRouter);

// Middleware tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Route chính
app.get('/', (req, res) => {
  res.render('home');
});


// Khởi động server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});