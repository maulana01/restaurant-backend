/** @format */

const models = require('../../models');
const { Op } = models.Sequelize;

const getAllCategories = async (page, limit, search = '') => {
  const checkSearch =
    search !== ''
      ? {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        }
      : {};
  const query = {
    offset: page ? (page - 1) * limit : 0,
    limit: limit ? parseInt(limit, 10) : 10,
    where: {
      ...checkSearch,
    },
    distinct: true,
    include: [{ model: models.Menu, as: 'items' }],
  };
  const query2 = {
    where: {
      ...checkSearch,
    },
    distinct: true,
    include: [{ model: models.Menu, as: 'items' }],
  };
  // return await models.Category.findAndCountAll(query);
  // const categories = await models.Category.findAll({ order: [['name', 'ASC']], include: [{ model: models.Menu, as: 'items' }] });
  // return categories.map((category) => category.dataValues);
  return await Promise.all([models.Category.findAll(query), models.Order.findAll(query2)]);
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
