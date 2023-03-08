/** @format */

const models = require('../../models');

const createOrder = async (body) => {
  return await models.Order.create(body);
};

const getByOrderCode = async (code) => {
  return await models.Order.findOne({ where: { order_code: code } });
};

const getAllByOrderCode = async (code) => {
  return await models.Order.findOne({
    where: {
      order_code: {
        [models.Sequelize.Op.iLike]: `%${code}%`,
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

const checkOrderCodeIfExists = async (code) => {
  return await models.Order.count({
    where: {
      order_code: code,
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

const allPaidOrders = async () => {
  return await models.Order.findAll({
    where: {
      status: 'Pesanan Sudah Dibayar',
    },
    order: [['updatedAt', 'DESC']],
  });
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
  allPaidOrders,
};
