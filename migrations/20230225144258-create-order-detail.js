/** @format */

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Order_Details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      menu_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Menus',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      qty: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.DECIMAL,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Order_Details');
  },
};

