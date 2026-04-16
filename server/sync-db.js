const db = require('./models');
const { execSync } = require('child_process');
const path = require('path');

async function syncDB() {
  try {
    const isAlter = process.argv.includes('--alter') || true; // Default to true for backward compatibility
    const isCleanup = process.argv.includes('--cleanup');

    if (isCleanup) {
      console.log(' Đang dọn dẹp các index dư thừa...');
      execSync('node scripts/cleanup-indexes.js', { cwd: __dirname });
    }

    console.log(` Đang đồng bộ cấu trúc database (alter: ${isAlter})...`);
    await db.sequelize.sync({ alter: isAlter });
    console.log(' Đồng bộ thành công!');
    
    // Automatically run cleanup after alter to prevent bloat
    if (isAlter) {
      console.log(' Đang kiểm tra và dọn dẹp các index bị trùng sau khi đồng bộ...');
      execSync('node scripts/cleanup-indexes.js', { cwd: __dirname });
    }

    process.exit(0);
  } catch (error) {
    console.error(' Lỗi đồng bộ:', error.message);
    process.exit(1);
  }
}

syncDB();
