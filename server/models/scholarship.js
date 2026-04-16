'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Scholarship extends Model {
    static associate(models) {
      Scholarship.hasMany(models.ScholarshipImage, { foreignKey: 'scholarship_id', as: 'images' });
    }
  }
  
  Scholarship.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true // Keeping for backward compatibility or as featured image, but user wants multiple. Actually, let's keep it as the first image.
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('scholarship', 'policy'),
      defaultValue: 'scholarship',
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Scholarship',
  });
  
  return Scholarship;
};
