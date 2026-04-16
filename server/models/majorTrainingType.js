'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MajorTrainingType extends Model {
    static associate(models) {
      // Junction tables often don't need additional associations
    }
  }
  MajorTrainingType.init({
    major_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'major_id',
      references: {
        model: 'Majors',
        key: 'id'
      }
    },
    training_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'training_type_id',
      references: {
        model: 'TrainingTypes',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'MajorTrainingType',
    tableName: 'majortrainingtypes',
    underscored: true,
    timestamps: false
  });
  return MajorTrainingType;
};
