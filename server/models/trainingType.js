'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TrainingType extends Model {
    static associate(models) {
      console.log("Kiem tra model:", models.MajorTrainingType);
      TrainingType.belongsToMany(models.Major, {
        through: 'MajorTrainingType',
        foreignKey: 'training_type_id',
        otherKey: 'major_id',
        as: 'Majors',
       
      });
    }
  }
  TrainingType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image_urls: {
      type: DataTypes.JSON,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'TrainingType',
  });
  return TrainingType;
};
