const homeService = require('../../services/admin/home.js');

exports.getLoginPage = (req, res) => {
  res.render('admin/login', { layout: 'login' });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  // Thêm timeout cho toàn bộ function
  const loginTimeout = setTimeout(() => {
    console.error('Login timeout - taking too long');
    if (!res.headersSent) {
      return res.status(500).render('admin/login', { 
        error: 'Đăng nhập quá lâu, vui lòng thử lại',
        layout: 'login' 
      });
    }
  }, 10000); // 10 seconds timeout

  try {
    console.log('Login attempt for:', email);
    
    // Kiểm tra input
    if (!email || !password) {
      clearTimeout(loginTimeout);
      return res.render('admin/login', { 
        error: 'Vui lòng nhập đầy đủ email và mật khẩu',
        layout: 'login' 
      });
    }

    // Gọi service với timeout
    const admin = await Promise.race([
      homeService.authenticateAdmin(email, password),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 8000)
      )
    ]);

    clearTimeout(loginTimeout);

    // Kiểm tra admin object
    if (!admin || !admin.user_id) {
      console.error('Invalid admin object returned:', admin);
      return res.render('admin/login', { 
        error: 'Lỗi hệ thống, vui lòng thử lại',
        layout: 'login' 
      });
    }
    
    // Lưu thông tin admin vào session
    req.session.admin = {
      id: admin.user_id,
      email: admin.email
    };

    // Đảm bảo session được save trước khi redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('admin/login', { 
          error: 'Lỗi lưu phiên đăng nhập',
          layout: 'login' 
        });
      }
      
      console.log('Login successful, session saved:', req.session.user);
      return res.redirect('/admin');
    });

  } catch (err) {
    clearTimeout(loginTimeout);
    console.error('Lỗi khi đăng nhập:', err.message);
    
    // Đảm bảo chỉ response một lần
    if (!res.headersSent) {
      return res.render('admin/login', { 
        error: err.message || 'Có lỗi xảy ra, vui lòng thử lại',
        layout: 'login' 
      });
    }
  }
};

exports.getDashboard = (req, res) => {
  res.render('admin/home', { layout: 'main-admin' });
};