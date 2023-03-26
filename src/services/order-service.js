/** @format */

const moment = require('moment');
const models = require('../../models');
require('moment/locale/id');

const createOrder = async (body) => {
  return await models.Order.create(body);
};

const getByOrderCode = async (order_code) => {
  return await models.Order.findOne({ where: { order_code } });
};

const getAllByOrderCode = async (order_code) => {
  return await models.Order.findOne({
    where: {
      order_code: {
        [models.Sequelize.Op.iLike]: `%${order_code}%`,
      },
    },
    order: [['order_code', 'DESC']],
  });
};

const getOrderDetail = async (order_id) => {
  return await models.Order_Detail.findAll({
    where: {
      order_id,
    },
    include: [
      {
        model: models.Menu,
        as: 'menu',
      },
    ],
  });
};

const checkOrderCodeIfExists = async (order_code) => {
  return await models.Order.count({
    where: {
      order_code,
    },
  }).then((count) => {
    if (count > 0) return true;
    else return false;
  });
};

const checkWaitingOrder = async (table_number) => {
  return await models.Order.count({
    where: {
      status: 'Menunggu Pelanggan Untuk Memesan',
      table_number,
    },
  }).then((count) => {
    if (count > 0) return true;
    else return false;
  });
};

const getNewOrder = async (table_number) => {
  return await models.Order.findOne({
    where: {
      status: 'Menunggu Pelanggan Untuk Memesan',
      table_number,
    },
  });
};

const getByTableNumber = async (table_number) => {
  return await models.Order.findOne({
    where: {
      table_number,
    },
  });
};

const cancelOrder = async (order_code) => {
  return await models.Order.update(
    {
      status: 'Pesanan Dibatalkan',
    },
    {
      where: {
        order_code,
      },
    }
  );
};

const createOrderDetail = async (body) => {
  return await models.Order_Detail.create(body);
};

const makeAnOrder = async (order_code, body) => {
  return await models.Order.update(body, {
    where: {
      order_code,
    },
  });
};

const changeStatusToOrderLine = async (order_code) => {
  return await models.Order.update(
    {
      status: 'Pesanan Dalam Antrian',
    },
    {
      where: {
        order_code,
      },
    }
  );
};

const changeOrderStatusToPaid = async (order_code) => {
  return await models.Order.update(
    {
      status: 'Pesanan Sudah Dibayar',
    },
    {
      where: {
        order_code,
      },
    }
  );
};

const getPaidOrderByOrderCode = async (order_code) => {
  return await models.Order.findOne({
    where: {
      status: 'Pesanan Sudah Dibayar',
      order_code,
    },
  });
};

const getAllPaidOrders = async () => {
  return await models.Order.findAll({
    where: {
      status: 'Pesanan Sudah Dibayar',
    },
    order: [['updatedAt', 'ASC']],
  });
};

const changeOrderStatusToProcessed = async (order_code) => {
  return await models.Order.update(
    {
      status: 'Pesanan Sedang Diproses',
    },
    {
      where: {
        order_code,
      },
    }
  );
};

module.exports = {
  createOrder,
  getByOrderCode,
  getAllByOrderCode,
  getOrderDetail,
  checkOrderCodeIfExists,
  checkWaitingOrder,
  getNewOrder,
  getByTableNumber,
  cancelOrder,
  createOrderDetail,
  makeAnOrder,
  changeStatusToOrderLine,
  changeOrderStatusToPaid,
  getPaidOrderByOrderCode,
  getAllPaidOrders,
  changeOrderStatusToProcessed,
};
