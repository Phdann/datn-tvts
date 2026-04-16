'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SystemConfig extends Model {
    static associate(models) {
      // No associations needed
    }
  }
  
  SystemConfig.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('boolean', 'text', 'json', 'number'),
      defaultValue: 'text'
    }
  }, {
    sequelize,
    modelName: 'SystemConfig',
    tableName: 'SystemConfigs'
  });
  
  return SystemConfig;
};
