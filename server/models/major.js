'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Major extends Model {
    static associate(models) {
      Major.belongsTo(models.Faculty, { foreignKey: 'faculty_id' });
      
      Major.hasMany(models.Specialization, { foreignKey: 'major_id' });
      
      Major.belongsToMany(models.SubjectGroup, { 
        through: 'MajorSubjectMapping',
        foreignKey: 'major_id'
      });
      Major.hasMany(models.HistoricalScore, { foreignKey: 'major_id' });
      Major.hasMany(models.Application, { foreignKey: 'major_id' });
      Major.hasMany(models.MajorImage, { foreignKey: 'major_id', as: 'Images' });
    }
  }
  Major.init({
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Faculties',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tuition: DataTypes.DECIMAL(15, 2),
    description: DataTypes.TEXT,
    quota: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Major',
  });
  return Major;
};
