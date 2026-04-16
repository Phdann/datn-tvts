'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApplicationDocument extends Model {
    static associate(models) {
      ApplicationDocument.belongsTo(models.Application, { foreignKey: 'application_id' });
    }
  }
  ApplicationDocument.init({
    application_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    file_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ApplicationDocument',
  });
  return ApplicationDocument;
};
