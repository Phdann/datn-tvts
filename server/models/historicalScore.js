'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistoricalScore extends Model {
    static associate(models) {
      HistoricalScore.belongsTo(models.Major, { foreignKey: 'major_id' });
      HistoricalScore.belongsTo(models.AdmissionMethod, { foreignKey: 'method_id' });
    }
  }
  HistoricalScore.init({
    major_id: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    method_id: DataTypes.INTEGER,
    score: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'HistoricalScore',
  });
  return HistoricalScore;
};
