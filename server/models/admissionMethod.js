'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdmissionMethod extends Model {
    static associate(models) {
      AdmissionMethod.hasMany(models.HistoricalScore, { foreignKey: 'method_id' });

    }
  }
  AdmissionMethod.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    image_url: DataTypes.STRING,
    image_urls: {
      type: DataTypes.JSON,
      allowNull: true
    },
    year: DataTypes.INTEGER,
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true 
    },
    type: {
      type: DataTypes.ENUM('method', 'quota', 'benchmark'),
      defaultValue: 'method'
    }
  }, {
    sequelize,
    modelName: 'AdmissionMethod',
  });
  return AdmissionMethod;
};
