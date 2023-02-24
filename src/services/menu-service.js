/** @format */

const models = require('../../models');

const getAllMenus = async () => {
  const menus = await models.Menu.findAll({ attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }, order: [['nama', 'ASC']] });
  return menus.map((menu) => menu.dataValues);
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
  createMenu,
  updateMenu,
  deleteMenu,
};
