// Tạo file test-db.js để test database (sửa lại cho mysql2/promise)
const db = require('./src/config/db');

async function testDatabase() {
  console.log('Testing database connection...');

  try {
    // Test 1: Kiểm tra kết nối cơ bản
    console.log('Test 1: Basic connection...');
    const [testResult] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection SUCCESS:', testResult);

    // Test 2: Kiểm tra table users
    console.log('Test 2: Check users table...');
    const [tables] = await db.execute('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.error('❌ Table "users" does NOT exist');
      return;
    } else {
      console.log('✅ Table "users" exists');
    }

    // Test 3: Kiểm tra cấu trúc table
    console.log('Test 3: Check table structure...');
    const [columns] = await db.execute('DESCRIBE users');
    console.log('✅ Table structure:', columns.map(col => col.Field));

    // Test 4: Kiểm tra dữ liệu admin
    console.log('Test 4: Count admin users...');
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    console.log('✅ Admin users count:', countResult[0].count);

    // Test 5: Kiểm tra admin cụ thể
    console.log('Test 5: Find specific admin...');
    const [adminResult] = await db.execute('SELECT user_id, email, role FROM users WHERE email = ?', 
      ['conghau17082004@gmail.com']);
    
    if (adminResult.length === 0) {
      console.log('❌ Admin user NOT found with email: conghau17082004@gmail.com');
      
      // Kiểm tra có admin nào khác không
      const [allAdmins] = await db.execute('SELECT user_id, email, role FROM users WHERE role = "admin"');
      console.log('📋 All admin users:', allAdmins);
    } else {
      console.log('✅ Admin user found:', adminResult[0]);
    }

    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database test FAILED:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Timeout test
setTimeout(() => {
  console.error('⚠️  Test timeout after 15 seconds');
  process.exit(1);
}, 15000);

// Chạy test
testDatabase();