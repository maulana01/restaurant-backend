/** @format */

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order_details' });
      this.belongsTo(models.Menu, {
        foreignKey: {
          name: 'menu_id',
          allowNull: true,
        },
        as: 'menu_ref',
        onDelete: 'CASCADE',
      });
    }
  }
  Order_Detail.init(
    {
      order_id: DataTypes.INTEGER,
      menu_id: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      price: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'Order_Detail',
    }
  );
  return Order_Detail;
};

