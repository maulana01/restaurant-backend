/** @format */

const express = require('express');
const router = express.Router();

const menuController = require('../../controllers/menu-controller');
const utils = require('../../utils/upload-image');
const { body, param } = require('express-validator');

const validateMenuPost = [
  body('nama').notEmpty().withMessage('Nama harus diisi'),
  body('nama').isLength({ min: 3 }).withMessage('Nama minimal 3 karakter'),
  body('harga').notEmpty().withMessage('Harga harus diisi'),
  body('harga').isLength({ min: 4 }).withMessage('Harga minimal 4 angka'),
  body('kategori').notEmpty().withMessage('Kategori harus diisi'),
];

const validateMenuUpdate = [
  param('id').notEmpty().withMessage('Id harus diisi'),
  param('id').isNumeric().withMessage('Id harus berupa angka'),
];

router.get('/', menuController.getAllMenu);
router.post('/', utils.upload().single('img_url'), validateMenuPost, menuController.createMenu);
router.patch('/:id', utils.upload().single('img_url'), validateMenuUpdate, menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
