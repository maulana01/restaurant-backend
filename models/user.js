/** @format */

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Order, {
        foreignKey: 'user_ids',
        as: 'made_by',
      });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      email: DataTypes.STRING,
      role: DataTypes.ENUM('OWNER', 'KOKI', 'KASIR'),
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};

