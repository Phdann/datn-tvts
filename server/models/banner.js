'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      
    }
  }
  
  Banner.init({
    title: DataTypes.STRING,
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link_url: DataTypes.STRING,
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      defaultValue: 'main_top' 
    }
  }, {
    sequelize,
    modelName: 'Banner',
  });
  
  return Banner;
};
