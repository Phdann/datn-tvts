'use strict';
const { Model } = require('sequelize');

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
  });
  return Post;
};
