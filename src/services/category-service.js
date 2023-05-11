/** @format */

const models = require('../../models');

const getAllCategories = async () => {
  const categories = await models.Category.findAll({ order: [['name', 'ASC']], include: [{ model: models.Menu, as: 'items' }] });
  return categories.map((category) => category.dataValues);
};

const getCategoryById = async (id) => {
  const category = await models.Category.findOne({ where: { id } });
  return category;
};

const createCategory = (body) => {
  const newCategory = models.Category.create(body);
  return newCategory;
};

const updateCategory = (id, body) => {
  const newCategory = models.Category.update(body, { where: { id } });
  return newCategory;
};

const deleteCategory = (id) => {
  const newCategory = models.Category.destroy({ where: { id } });
  return newCategory;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
