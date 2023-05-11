/** @format */

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_code: {
        type: Sequelize.STRING,
      },
      table_number: {
        type: Sequelize.INTEGER,
      },
      payment_amount: {
        type: Sequelize.DECIMAL,
      },
      status: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      // phone_number: {
      //   type: Sequelize.STRING,
      // },
      payment_method: {
        type: Sequelize.STRING,
      },
      payment_expired_date: {
        type: Sequelize.STRING,
      },
      virtual_account_number: {
        type: Sequelize.STRING,
      },
      served: {
        type: Sequelize.BOOLEAN,
      },
      device_ids: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Orders');
  },
};

