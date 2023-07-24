/** @format */

const express = require('express');
const router = express.Router();

const menuController = require('../../controllers/menu-controller');
const utils = require('../../utils/upload-image');
const { body, param } = require('express-validator');

const validateMenuPost = [
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('name').isLength({ min: 3 }).withMessage('Nama minimal 3 karakter'),
  body('price').notEmpty().withMessage('Harga harus diisi'),
  body('price').isLength({ min: 4 }).withMessage('Harga minimal 4 angka'),
  body('category_id').notEmpty().withMessage('Kategori harus diisi'),
];

const validateMenuUpdate = [
  param('id').notEmpty().withMessage('Id harus diisi'),
  param('id').isNumeric().withMessage('Id harus berupa angka'),
];

router.get('/', menuController.getAllMenu);
router.get('/:id', menuController.getById);
router.post('/', utils.upload('menus').single('image'), validateMenuPost, menuController.createMenu);
router.patch('/:id', utils.upload('menus').single('image'), validateMenuUpdate, menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
