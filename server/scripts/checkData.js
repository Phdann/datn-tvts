const { Major, Specialization } = require('../models');

async function checkData() {
  const majors = await Major.findAll();
  console.log('Majors in DB:');
  majors.forEach(m => console.log(`- "${m.name}" (desc: "${m.description}")`));
  
  const specs = await Specialization.findAll();
  console.log('Specs in DB:');
  specs.forEach(s => console.log(`- "${s.name}" (desc: "${s.description}")`));
  
  process.exit(0);
}

checkData();
