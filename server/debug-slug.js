const { Post, Category, User } = require('./models');

async function checkPost() {
  try {
    const slug = 'bao-da-nang-doi-duong-tu-duy-khoa-hoc';
    const post = await Post.findOne({ 
      where: { slug } ,
      include: [
        { model: Category },
        { model: User, attributes: ['id', 'email'] }
      ]
    });
    if (post) {
      console.log('Post found JSON:', JSON.stringify(post, null, 2));
    } else {
      console.log('Post NOT found');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkPost();
