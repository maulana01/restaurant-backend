/** @format */

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Order_Detail, {
        foreignKey: 'menu_id',
        as: 'menu_ref',
      });
      this.belongsTo(models.Category, { foreignKey: 'category_id', as: 'items' });
    }
  }
  Menu.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(15, 0),
      category_id: DataTypes.INTEGER,
      image: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Menu',
    }
  );
  return Menu;
};

