const express = require('express');
const router = express.Router();
const productRouter = require('./product_router.js');
const authorRouter = require('./author_router.js');
const orderRouter = require('./order_router.js');
const customerRouter = require('./customer_router.js');
const homeController = require('../../controllers/admin/home.js');
const publisherRouter = require('./publisher_router.js');
const categoryRouter = require('./category_router.js');

// Middleware kiểm tra đăng nhập admin
function checkAdmin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// Login routes
router.get('/login', homeController.getLoginPage);
router.post('/login', homeController.postLogin);

// Trang chủ admin
router.get('/', checkAdmin, (req, res) => {
  res.render('admin/home', { layout: 'main-admin' });
});

// Các router con chỉ cho admin
router.use('/products', checkAdmin, productRouter);
router.use('/authors', checkAdmin, authorRouter);
router.use('/orders', checkAdmin, orderRouter);
router.use('/customers', checkAdmin, customerRouter);
router.use('/publishers', checkAdmin, publisherRouter);
router.use('/categories', checkAdmin, categoryRouter);
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/admin');
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
});

module.exports = router;


