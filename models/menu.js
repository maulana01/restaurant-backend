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
        as: 'menu',
      });
    }
  }
  Menu.init(
    {
      nama: DataTypes.STRING,
      harga: DataTypes.DECIMAL(15, 0),
      kategori: DataTypes.STRING,
      img_url: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Menu',
    }
  );
  return Menu;
};

