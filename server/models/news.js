'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate(models) {
     
    }
  }
  
  News.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    excerpt: DataTypes.TEXT,
    featured_image: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    published_at: DataTypes.DATE,
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'News',
  });
  
  return News;
};
