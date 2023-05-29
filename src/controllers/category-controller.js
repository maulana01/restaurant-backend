/** @format */

const categoryService = require('../services/category-service');
const { validationResult } = require('express-validator');
const { extname } = require('path');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dcdu2v41u',
  api_key: '189369424679696',
  api_secret: 'xO_NsHIMoLR3yqPLraq0I0yKbC0',
});

const getAllCategory = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({ status: 'success', message: 'Category list', data: categories });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.file) return res.status(400).json({ status: 'error', message: 'Image is required' });
    const getExtFile = extname(req.file.originalname);
    const imageUrl = req.file.path.replace(getExtFile, '');
    const newCategory = {
      name,
      image: imageUrl,
    };
    const validateForm = validationResult(req);
    if (!validateForm.isEmpty()) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(400).json({ status: 'error', errors: validateForm.array() });
    }
    categoryService.createCategory(newCategory);
    return res.status(201).json({ status: 'success', message: 'Category created' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const getCategoryById = await categoryService.getCategoryById(id);
    let imageUrl;
    if (req.file) {
      const getExtFile = extname(req.file.originalname);
      imageUrl = req.file.path.replace(getExtFile, '');
    }
    const newCategory = {
      name,
      image: imageUrl,
    };
    const validateForm = validationResult(req);
    if (!validateForm.isEmpty()) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(400).json({ status: 'error', errors: validateForm.array() });
    }
    if (req.file && getCategoryById.image) {
      const getImgId = getCategoryById.image.substr(getCategoryById.image.length - 20);
      await cloudinary.uploader.destroy(`public/images/categories/${getImgId}`);
    }
    categoryService.updateCategory(id, newCategory);
    return res.status(201).json({ status: 'success', message: 'Category updated' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const getCategoryById = await categoryService.getCategoryById(id);
    if (getCategoryById.image) {
      const getImgId = getCategoryById.image.substr(getCategoryById.image.length - 20);
      await cloudinary.uploader.destroy(`public/images/categories/${getImgId}`);
    }
    categoryService.deleteCategory(id);
    return res.status(200).json({ status: 'success', message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const linkimg = `https://res.cloudinary.com/dcdu2v41u/image/upload/v1681722619/public/images/categories/${id}`;
    const getImgId = linkimg.substr(linkimg.length - 20);
    await cloudinary.uploader.destroy(`public/images/categories/${getImgId}`);
    return res.status(200).json({ status: 'success', message: 'Category image deleted' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoryImage,
};
