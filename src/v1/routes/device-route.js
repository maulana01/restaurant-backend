/** @format */

const express = require('express');
const router = express.Router();

const deviceController = require('../../controllers/device-controller');
const { body, param } = require('express-validator');

const validateDevicePost = [
  body('device_id').notEmpty().withMessage('Device ID harus diisi'),
  body('device_brand').notEmpty().withMessage('Device Brand harus diisi'),
  body('device_name').notEmpty().withMessage('Device Name harus diisi'),
];

router.get('/', deviceController.getAll);
router.get('/:device_id', deviceController.getDeviceById);
router.post('/', validateDevicePost, deviceController.createDevice);

module.exports = router;
