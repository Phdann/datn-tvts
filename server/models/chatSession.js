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
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ChatSession',
  });
  return ChatSession;
};
