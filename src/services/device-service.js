/** @format */

const models = require('../../models');

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

module.exports = {
  getDeviceById,
  createDevice,
};
