'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      ChatMessage.belongsTo(models.ChatSession, { foreignKey: 'session_id' });
    }
  }
  ChatMessage.init({
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ChatSessions',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
      defaultValue: 'user'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ChatMessage',
  });
  return ChatMessage;
};
