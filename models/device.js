/** @format */

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Order, {
        foreignKey: 'device_ids',
        as: 'device',
      });
    }
  }
  Device.init(
    {
      device_id: DataTypes.STRING,
      device_brand: DataTypes.STRING,
      device_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Device',
    }
  );
  return Device;
};
