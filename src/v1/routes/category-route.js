/** @format */

const express = require('express');
const router = express.Router();

const categoryController = require('../../controllers/category-controller');
const utils = require('../../utils/upload-image');
const { body, param } = require('express-validator');

const validateCategoryPost = [
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('name').isLength({ min: 3 }).withMessage('Nama minimal 3 karakter'),
];

const validateCategoryUpdate = [
  param('id').notEmpty().withMessage('Id harus diisi'),
  param('id').isNumeric().withMessage('Id harus berupa angka'),
];

router.get('/', categoryController.getAllCategory);
router.get('/:id', categoryController.getById);
router.post('/', utils.upload('categories').single('image'), validateCategoryPost, categoryController.createCategory);
router.patch('/:id', utils.upload('categories').single('image'), validateCategoryUpdate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.delete('/image/:id', categoryController.deleteCategoryImage);

module.exports = router;
