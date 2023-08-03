/** @format */

const models = require('../../models');
const { Op } = models.Sequelize;

const getAllMenus = async (page, limit, search = '', filter = '') => {
  const filterCategoryMenu = filter != '' ? Object.entries(filter).map(([fieldName, filterOrder]) => [fieldName, filterOrder]) : {};
  const filterArrToObj = filter != '' && Object.fromEntries(filterCategoryMenu);
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
    filterCategoryMenu,
    distinct: true,
    include: [{ model: models.Category, as: 'items' }],
  };
  if (filterCategoryMenu.length > 0) {
    if (filterArrToObj.categoryId) {
      query.where = {
        ...query.where,
        category_id: {
          [Op.eq]: `${filterArrToObj.categoryId}`,
        },
      };
    }
  }

  return await models.Menu.findAndCountAll(query);
  // console.log('ini filtermenu', filterCategoryMenu);
  // console.log('ini filtermenu category-id', filterArrToObj.categoryId);
  // console.log('ini filtermenu length', filterCategoryMenu.length);
  // const menus = await models.Menu.findAll({ order: [['name', 'ASC']], include: [{ model: models.Category, as: 'items' }] });
  // return menus.map((menu) => menu.dataValues);
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
