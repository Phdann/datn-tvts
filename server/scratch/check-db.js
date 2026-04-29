const db = require('../models');

async function checkCategories() {
  try {
    const categories = await db.Category.findAll();
    console.log('Categories in DB:');
    categories.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`);
    });
    
    const posts = await db.Post.findAll({ limit: 5 });
    console.log('\nRecent Posts:');
    posts.forEach(p => {
      console.log(`- ID: ${p.id}, Title: ${p.title}, CategoryID: ${p.category_id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCategories();
