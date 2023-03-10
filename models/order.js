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
    }
  }
  Order.init(
    {
      order_code: DataTypes.STRING,
      table_number: DataTypes.INTEGER,
      payment_amount: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      nama: DataTypes.STRING,
      no_hp: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );
  return Order;
};

