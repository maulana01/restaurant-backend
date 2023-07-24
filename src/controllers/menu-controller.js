/** @format */
const menuService = require('../services/menu-service');
const { validationResult } = require('express-validator');
const { extname } = require('path');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dcdu2v41u',
  api_key: '189369424679696',
  api_secret: 'xO_NsHIMoLR3yqPLraq0I0yKbC0',
});

const getAllMenu = async (req, res) => {
  try {
    const menus = await menuService.getAllMenus();
    return res.status(200).json({ status: 'success', message: 'Menu list', data: menus });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await menuService.getById(id);
    if (!menu) return res.status(404).json({ status: 'error', message: 'Menu not found' });
    return res.status(200).json({ status: 'success', data: menu });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const createMenu = async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    if (!req.file) return res.status(400).json({ status: 'error', message: 'Image is required' });
    const getExtFile = extname(req.file.originalname);
    const imageUrl = req.file.path.replace(getExtFile, '');
    const newMenu = {
      name,
      price,
      category_id,
      image: imageUrl,
    };
    const validateForm = validationResult(req);
    if (!validateForm.isEmpty()) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(400).json({ status: 'error', errors: validateForm.array() });
    }
    menuService.createMenu(newMenu);
    return res.status(201).json({ status: 'success', message: 'Menu created' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    const getMenuById = await menuService.getById(id);
    let imageUrl;
    if (req.file) {
      const getExtFile = extname(req.file.originalname);
      imageUrl = req.file.path.replace(getExtFile, '');
    }
    const newMenu = {
      name,
      price,
      category_id,
      image: imageUrl,
    };
    const validateForm = validationResult(req);
    if (!validateForm.isEmpty()) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(400).json({ status: 'error', errors: validateForm.array() });
    }
    if (req.file && getMenuById.image) {
      const getImgId = getMenuById.image.substr(getMenuById.image.length - 20);
      await cloudinary.uploader.destroy(`public/images/menus/${getImgId}`);
    }
    menuService.updateMenu(id, newMenu);
    return res.status(201).json({ status: 'success', message: 'Menu updated' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const getById = await menuService.getById(id);
    if (getById.image) {
      const getImgId = getById.image.substr(getById.image.length - 20);
      await cloudinary.uploader.destroy(`public/images/menus/${getImgId}`);
    }
    menuService.deleteMenu(id);
    return res.status(201).json({ status: 'success', message: 'Menu deleted' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAllMenu,
  getById,
  createMenu,
  updateMenu,
  deleteMenu,
};
