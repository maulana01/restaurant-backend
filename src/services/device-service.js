/** @format */

const models = require('../../models');
const { Op } = models.Sequelize;

const getAll = async (page, limit, search = '') => {
  const checkSearch =
    search !== ''
      ? {
          device_name: {
            [Op.iLike]: `%${search}%`,
          },
        }
      : {};
  const query = {
    offset: page ? (page - 1) * limit : 0,
    limit: limit ? parseInt(limit, 10) : 10,
    where: {
      ...checkSearch,
    },
    distinct: true,
  };
  return await models.Device.findAndCountAll(query);
  // const devices = await models.Device.findAll();
  // return devices;
};

const getDeviceById = async (device_id) => {
  const device = await models.Device.findOne({ where: { device_id } });
  return device;
};

const createDevice = async (device_id, device_brand, device_name) => {
  const device = await models.Device.create({
    device_id,
    device_brand,
    device_name,
  });
  return device;
};

const deleteDevice = async (id) => {
  const device = await models.Device.destroy({ where: { id } });
  return device;
};

module.exports = {
  getAll,
  getDeviceById,
  createDevice,
  deleteDevice,
};
