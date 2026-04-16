'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ScholarshipImage extends Model {
    static associate(models) {
      ScholarshipImage.belongsTo(models.Scholarship, { foreignKey: 'scholarship_id', as: 'scholarship' });
    }
  }
  
  ScholarshipImage.init({
    scholarship_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ScholarshipImage',
    tableName: 'ScholarshipImages'
  });
  
  return ScholarshipImage;
};
