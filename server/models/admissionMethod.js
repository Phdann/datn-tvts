'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdmissionMethod extends Model {
    static associate(models) {
      AdmissionMethod.hasMany(models.HistoricalScore, { foreignKey: 'method_id' });
      AdmissionMethod.hasMany(models.Application, { foreignKey: 'method_id' });
    }
  }
  AdmissionMethod.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AdmissionMethod',
  });
  return AdmissionMethod;
};
