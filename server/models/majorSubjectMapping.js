'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MajorSubjectMapping extends Model {
    static associate(models) {
      MajorSubjectMapping.belongsTo(models.Major, { foreignKey: 'major_id' });
      MajorSubjectMapping.belongsTo(models.SubjectGroup, { foreignKey: 'subject_group_id' });
    }
  }
  MajorSubjectMapping.init({
    major_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    subject_group_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'MajorSubjectMapping',
    tableName: 'majorsubjectmappings',
    timestamps: false
  });
  return MajorSubjectMapping;
};
