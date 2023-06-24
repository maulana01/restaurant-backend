/** @format */

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Order_Detail, {
        foreignKey: 'order_id',
        as: 'order_details',
      });
      this.belongsTo(models.Device, {
        foreignKey: {
          name: 'device_ids',
          allowNull: true,
        },
        as: 'device',
      });
      this.belongsTo(models.User, {
        foreignKey: {
          name: 'user_ids',
          allowNull: true,
        },
        as: 'made_by',
      });
    }
  }
  Order.init(
    {
      order_code: DataTypes.STRING,
      table_number: DataTypes.INTEGER,
      payment_amount: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      name: DataTypes.STRING,
      // phone_number: DataTypes.STRING,
      payment_method: DataTypes.STRING,
      payment_expired_date: DataTypes.STRING,
      virtual_account_number: DataTypes.STRING,
      qr_url: DataTypes.TEXT,
      user_ids: DataTypes.INTEGER,
      // served: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );
  return Order;
};

