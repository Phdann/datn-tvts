'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      
    }
  }
  
  Event.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    location: DataTypes.STRING,
    event_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: DataTypes.DATE,
    image: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
      defaultValue: 'upcoming'
    },
    registration_link: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Event',
  });
  
  return Event;
};
