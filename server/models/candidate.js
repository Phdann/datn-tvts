'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Candidate extends Model {
    static associate(models) {
      // Associations can be defined here
    }
  }
  
  Candidate.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: DataTypes.STRING,
    high_school_score: DataTypes.DECIMAL(5, 2),
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Candidate',
  });
  
  return Candidate;
};
