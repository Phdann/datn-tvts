const { sequelize } = require('../models');

async function cleanupIndexes() {
  try {
    console.log('--- Starting Database Index Cleanup ---');
    
    // Get all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    const dbName = sequelize.config.database;
    const tableKey = `Tables_in_${dbName}`;

    for (const tableRow of tables) {
      const tableName = tableRow[tableKey];
      console.log(`Checking table: ${tableName}`);

      const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);
      
      // We want to keep:
      // 1. PRIMARY
      // 2. The first occurrence of an index for each set of columns
      // 3. Foreign key indexes (usually named table_column_foreign)
      
      const seenColumns = new Set();
      const duplicateIndexes = [];

      for (const idx of indexes) {
        const keyName = idx.Key_name;
        const columnName = idx.Column_name;

        if (keyName === 'PRIMARY') continue;
        
        // If it's a redundant index (ends with _2, _3, etc.)
        if (keyName.match(/_\d+$/)) {
           duplicateIndexes.push(keyName);
           continue;
        }

        // If we've already seen an index for this column and this one is not the "main" one
        // (This is a bit risky but given the state, we need to clean up)
        // For now, let's just stick to the numbered ones as they are the most obvious duplicates
      }

      // Remove duplicates
      const uniqueDuplicates = [...new Set(duplicateIndexes)];
      for (const indexName of uniqueDuplicates) {
        console.log(`  Dropping redundant index: ${indexName} from ${tableName}`);
        try {
          await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${indexName}\``);
        } catch (err) {
          console.error(`  Failed to drop index ${indexName}: ${err.message}`);
        }
      }
    }

    console.log('--- Cleanup Finished ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupIndexes();
