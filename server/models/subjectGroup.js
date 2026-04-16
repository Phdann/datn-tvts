'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubjectGroup extends Model {
    static associate(models) {
      SubjectGroup.belongsToMany(models.Major, { 
        through: 'MajorSubjectMapping',
        foreignKey: 'subject_group_id'
      });
    }
  }
  SubjectGroup.init({
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SubjectGroup',
  });
  return SubjectGroup;
};
