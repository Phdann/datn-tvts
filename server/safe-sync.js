const { sequelize } = require('./models');

async function safeSync() {
  try {
    console.log(' Attempting manual column addition...');

    try {
      await sequelize.query('ALTER TABLE AdmissionMethods ADD COLUMN is_public BOOLEAN DEFAULT true');
      console.log(' Column "is_public" added to AdmissionMethods table.');
    } catch (e) {
      console.log(' Column "is_public" might already exist or error:', e.message);
    }

    console.log(' Manual sync completed. You should keep SYNC_DB=false to avoid the "Too many keys" error.');
    process.exit(0);
  } catch (error) {
    console.error(' Safe Sync Error:', error.message);
    process.exit(1);
  }
}

safeSync();
