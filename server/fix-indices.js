const { sequelize } = require('./models');

async function fixIndices() {
  try {
    console.log(' Checking indices for Applications table...');
    const [results] = await sequelize.query('SHOW INDEX FROM Applications');
    console.log(`Found ${results.length} index entries.`);
    
    const indexNames = [...new Set(results.map(r => r.Key_name))];
    console.log('Index Names:', indexNames);

    if (indexNames.length > 50) {
      console.log(' Too many indices detected. Attempting to drop redundant ones...');
      for (const name of indexNames) {
        if (name !== 'PRIMARY' && (name.includes('major_id') || name.includes('method_id') || name.includes('candidate_id'))) {
          
           try {
             await sequelize.query(`ALTER TABLE Applications DROP INDEX ${name}`);
             console.log(`Dropped index: ${name}`);
           } catch (e) {
             console.log(`Failed to drop ${name}: ${e.message}`);
           }
        }
      }
    }
    
    console.log(' Index audit complete.');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

fixIndices();
