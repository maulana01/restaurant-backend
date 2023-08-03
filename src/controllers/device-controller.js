/** @format */

const deviceService = require('../services/device-service');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    if (search) {
      if (search == '') {
        return res.status(200).json({ status: 'success', message: 'Search is empty' });
      } else {
        const devices = await deviceService.getAll(page, limit, search);
        return res.status(200).json({
          status: 'success',
          message: 'Device List',
          current_page: page,
          total_pages: Math.ceil(devices.count / limit),
          total_items: devices.count,
          search,
          data: devices,
        });
      }
    } else {
      const devices = await deviceService.getAll(page, limit, '');
      return res.status(200).json({
        status: 'success',
        message: 'Device List',
        current_page: page,
        total_pages: Math.ceil(devices.count / limit),
        total_items: devices.rows.length,
        data: devices,
      });
    }
    // return res.status(200).json({ status: 'success', data: devices });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

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

const deleteDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await deviceService.deleteDevice(id);
    return res.status(200).json({ status: 'success', data: device });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAll,
  getDeviceById,
  createDevice,
  deleteDevice,
};
