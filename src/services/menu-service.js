/** @format */

const models = require('../../models');

const getAllMenus = async () => {
  const menus = await models.Menu.findAll({ order: [['name', 'ASC']] });
  return menus.map((menu) => menu.dataValues);
};

const getById = async (id) => {
  const menu = await models.Menu.findOne({ where: { id } });
  return menu;
};

const createMenu = (body) => {
  const newMenu = models.Menu.create(body);
  return newMenu;
};

const updateMenu = (id, body) => {
  const newMenu = models.Menu.update(body, { where: { id } });
  return newMenu;
};

const deleteMenu = (id) => {
  const newMenu = models.Menu.destroy({ where: { id } });
  return newMenu;
};

module.exports = {
  getAllMenus,
  getById,
  createMenu,
  updateMenu,
  deleteMenu,
};
