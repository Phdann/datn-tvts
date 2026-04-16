'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Specialization extends Model {
    static associate(models) {
     
      Specialization.belongsTo(models.Major, { foreignKey: 'major_id' });
      
      
    }
  }
  
  Specialization.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    major_id: {  
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Majors',
        key: 'id'
      }
    },
    description: DataTypes.TEXT,
    admission_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Specialization',
  });
  
  return Specialization;
};
