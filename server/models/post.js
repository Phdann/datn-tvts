'use strict';
const { Model } = require('sequelize');

const slugify = (str) => {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return str.trim();
};

module.exports = (sequelize, DataTypes) => {
 
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Category, { foreignKey: 'category_id' });
      Post.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Post.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    excerpt: DataTypes.TEXT,
    content: DataTypes.TEXT,
    image_url: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    published_at: DataTypes.DATE,
    category_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    faculty_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
    hooks: {
      beforeValidate: (post) => {
        if (post.title && (!post.slug || post.slug === '')) {
          post.slug = slugify(post.title);
        }
      },
      beforeUpdate: (post) => {
        if (post.title && post.changed('title')) {
          post.slug = slugify(post.title);
        }
      }
    }
  });
  return Post;
};
