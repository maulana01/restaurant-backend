/** @format */

// const moment = require('moment');
const models = require('../../models');
const { Op } = models.Sequelize;
const moment = require('moment/moment');

const TODAY_START = new Date().setHours(7, 0, 0, 0);
const TODAY_END = new Date().setHours(30, 59, 59, 59);
const convertStartDate = moment().startOf('day');
const convertEndDate = moment().endOf('day');

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
        as: 'menu_ref',
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

const checkExistOrderUnlessClosedAndCanceled = async (table_number) => {
  return await models.Order.count({
    where: {
      status: {
        [models.Sequelize.Op.notIn]: ['Order Closed', 'Pesanan Dibatalkan'],
      },
      table_number,
    },
  }).then((count) => {
    if (count > 0) return true;
    else return false;
  });
};

const getFinishedOrderByTableNumber = async (table_number) => {
  return await models.Order.findOne({
    where: {
      status: 'Pesanan Selesai',
      table_number,
    },
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

const getNewOrderByDevice = async (device_ids) => {
  return await models.Order.findOne({
    where: {
      status: {
        [models.Sequelize.Op.or]: [
          'Menunggu Pelanggan Untuk Memesan',
          'Menunggu Pembayaran',
          'Pesanan Sudah Dibayar',
          'Pesanan Sedang Diproses',
          'Pesanan Selesai',
        ],
      },
      device_ids,
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
  console.log('TODAY_START', convertStartDate);
  console.log('TODAY_END', convertEndDate);
  console.log('sdadasd', new Date());
  return await models.Order.findAll({
    where: {
      status: 'Pesanan Sudah Dibayar',
      // change it later to createdAt
      updatedAt: {
        [models.Sequelize.Op.gt]: convertStartDate,
        [models.Sequelize.Op.lt]: convertEndDate,
      },
    },
    order: [['updatedAt', 'ASC']],
  });
};

const changeOrderStatusToProcessed = async (order_code, user_ids) => {
  return await models.Order.update(
    {
      status: 'Pesanan Sedang Diproses',
      user_ids,
    },
    {
      where: {
        order_code,
      },
    }
  );
};

const getProcessedOrderByOrderCode = async (order_code) => {
  return await models.Order.findOne({
    where: {
      status: 'Pesanan Sedang Diproses',
      order_code,
    },
  });
};

const getAllProcessedOrders = async () => {
  return await models.Order.findAll({
    where: {
      status: 'Pesanan Sedang Diproses',
      // change it later to createdAt
      updatedAt: {
        [models.Sequelize.Op.gt]: convertStartDate,
        [models.Sequelize.Op.lt]: convertEndDate,
      },
    },
    order: [['updatedAt', 'ASC']],
  });
};

const changeOrderStatusToFinished = async (order_code) => {
  return await models.Order.update(
    {
      status: 'Pesanan Selesai',
    },
    {
      where: {
        order_code,
      },
    }
  );
};

const getFinishedOrderByOrderCode = async (order_code) => {
  return await models.Order.findOne({
    where: {
      status: 'Pesanan Selesai',
      order_code,
    },
  });
};

const getAllFinishedOrders = async () => {
  return await models.Order.findAll({
    where: {
      status: 'Pesanan Selesai',
      // change it later to createdAt
      updatedAt: {
        [models.Sequelize.Op.gt]: convertStartDate,
        [models.Sequelize.Op.lt]: convertEndDate,
      },
    },
    order: [['updatedAt', 'ASC']],
  });
};

const closeOrder = async (order_code) => {
  return await models.Order.update(
    {
      status: 'Order Closed',
    },
    {
      where: {
        order_code,
      },
    }
  );
};

const getAllOrders = async (page, limit, search = '', sort = '', filter = '') => {
  // Construct the `order` array based on the `storeSort` object
  const order = sort != '' ? Object.entries(sort).map(([fieldName, sortOrder]) => [fieldName, sortOrder]) : [['createdAt', 'DESC']];
  const checkSearch =
    search != ''
      ? {
          [Op.or]: [{ order_code: { [Op.iLike]: `%${search}%` } }, { name: { [Op.iLike]: `%${search}%` } }],
        }
      : {};

  /* NOTE FOR MYSELF */
  const getFilterList = filter != '' ? Object.entries(filter).map(([fieldName, sortFilter]) => [fieldName, sortFilter]) : {};
  const filterArrToObj = filter != '' && Object.fromEntries(getFilterList);
  /* OPERATION KEY OBJECT DI FILTERLIST GA JADI DI PAKE, YG DI PAKE CUMA VALUE NYA AJA */
  /* NOTE FOR MYSELF */

  const query = {
    offset: page ? (page - 1) * limit : 0,
    limit: limit ? parseInt(limit, 10) : 10,
    where: {
      ...checkSearch,
    },
    order,
    distinct: true,
  };
  const query2 = {
    where: {
      ...checkSearch,
    },
    order,
    distinct: true,
  };

  if (getFilterList.length > 0) {
    if (filterArrToObj.status) {
      query.where = {
        ...query.where,
        status: {
          [Op.iLike]: `${filterArrToObj.status.value}`,
        },
      };
      query2.where = {
        ...query.where,
        status: {
          [Op.iLike]: `${filterArrToObj.status.value}`,
        },
      };
    }
    if (filterArrToObj.startDate && filterArrToObj.endDate) {
      // Assuming you have the filterArrToObj object with the startDate and endDate values
      const startDateValue = filterArrToObj.startDate.value;
      const endDateValue = filterArrToObj.endDate.value;

      // Create new Date objects in "Asia/Jakarta" timezone
      const startDateInJakarta = new Date(startDateValue);
      const endDateInJakarta = new Date(endDateValue);

      const jakartaTimezone = 'Asia/Jakarta';
      const options = { timeZone: jakartaTimezone };

      // Set the start date to the beginning of the day (00:00:00)
      startDateInJakarta.setHours(7, 0, 0, 0);

      // Set the end date to the end of the day (23:59:59)
      endDateInJakarta.setHours(30, 59, 59, 59);

      // Format the dates into strings in "Asia/Jakarta" timezone
      const formattedStartDate = startDateInJakarta.toLocaleString('en-US', options);
      const formattedEndDate = endDateInJakarta.toLocaleString('en-US', options);

      console.log('formattedStartDate', formattedStartDate);
      console.log('formattedEndDate', formattedEndDate);

      query.where = {
        ...query.where,
        createdAt: {
          [Op.gt]: formattedStartDate,
          [Op.lt]: formattedEndDate,
        },
      };
      query2.where = {
        ...query.where,
        createdAt: {
          [Op.gt]: formattedStartDate,
          [Op.lt]: formattedEndDate,
        },
      };
    }
  }

  // return await models.Order.findAndCountAll(query);
  // return 2 query
  return await Promise.all([models.Order.findAll(query), models.Order.findAll(query2)]);
};

const deleteOrder = async (order_code) => {
  return await models.Order.destroy({
    where: {
      order_code,
    },
  });
};

module.exports = {
  createOrder,
  getByOrderCode,
  getAllByOrderCode,
  getOrderDetail,
  checkOrderCodeIfExists,
  checkExistOrderUnlessClosedAndCanceled,
  getNewOrder,
  getNewOrderByDevice,
  getByTableNumber,
  cancelOrder,
  createOrderDetail,
  makeAnOrder,
  changeStatusToOrderLine,
  changeOrderStatusToPaid,
  getPaidOrderByOrderCode,
  getAllPaidOrders,
  changeOrderStatusToProcessed,
  getProcessedOrderByOrderCode,
  getAllProcessedOrders,
  changeOrderStatusToFinished,
  getFinishedOrderByOrderCode,
  getAllFinishedOrders,
  getFinishedOrderByTableNumber,
  closeOrder,
  getAllOrders,
  deleteOrder,
};
