'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Faculty extends Model {
    static associate(models) {
      Faculty.hasMany(models.Major, { foreignKey: 'faculty_id' });
    }
  }
  Faculty.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      unique: true
    },
    introduction: DataTypes.TEXT,
    logo_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Faculty',
  });
  return Faculty;
};
