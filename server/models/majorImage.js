'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MajorImage extends Model {
    static associate(models) {
      MajorImage.belongsTo(models.Major, { foreignKey: 'major_id' });
    }
  }
  MajorImage.init({
    major_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'MajorImage',
  });
  return MajorImage;
};
