/** @format */

const deviceService = require('../services/device-service');

const getDeviceById = async (req, res, next) => {
  try {
    const { device_id } = req.params;
    const device = await deviceService.getDeviceById(device_id);
    if (device) {
      return res.status(200).json({ status: 'success', data: device });
    } else {
      return res.status(400).json({ status: 'error', message: 'Device not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const createDevice = async (req, res, next) => {
  try {
    const { device_id, device_brand, device_name } = req.body;
    const device = await deviceService.createDevice(device_id, device_brand, device_name);
    return res.status(200).json({ status: 'success', data: device });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getDeviceById,
  createDevice,
};
