'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.Major, { foreignKey: 'major_id' });
      Application.belongsTo(models.Candidate, { foreignKey: 'candidate_id' });
      Application.belongsTo(models.AdmissionMethod, { foreignKey: 'admission_method_id' });
    }
  }
  
  Application.init({
    major_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    admission_method_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    },
    submission_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Application',
  });
  
  return Application;
};
