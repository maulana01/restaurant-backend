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
      this.belongsTo(models.Device, { foreignKey: 'device_ids', as: 'device' });
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
      served: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );
  return Order;
};

