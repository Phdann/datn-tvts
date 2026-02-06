'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'role_id' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('active', 'banned', 'pending'),
      defaultValue: 'active'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
