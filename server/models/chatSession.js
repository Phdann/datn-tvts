'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatSession extends Model {
    static associate(models) {
      ChatSession.belongsTo(models.User, { foreignKey: 'user_id' });
      ChatSession.hasMany(models.ChatMessage, { foreignKey: 'session_id' });
    }
  }
  ChatSession.init({
    user_id: DataTypes.INTEGER,
    visitor_name: DataTypes.STRING,
    visitor_phone: DataTypes.STRING,
    visitor_email: DataTypes.STRING,
    visitor_school: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ChatSession',
  });
  return ChatSession;
};
