/** @format */

const models = require('../../models');
const { Op } = models.Sequelize;

const getAllUser = async (page, limit, search = '') => {
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
    attributes: { exclude: ['password', 'reset_password_token'] },
  };
  return await models.User.findAndCountAll(query);
  // const users = await models.User.findAll({ attributes: { exclude: ['password', 'reset_password_token'] }, order: [['name', 'ASC']] });
  // return users.map((user) => user.dataValues);
};

const getById = async (id) => {
  const user = await models.User.findOne({ where: { id } });
  return user;
};

const getByEmail = async (email) => {
  const user = await models.User.findOne({ where: { email } });
  return user;
};

const getByToken = async (token) => {
  const user = await models.User.findOne({ where: { reset_password_token: token } });
  return user;
};

const createUser = (body) => {
  const newUser = models.User.create(body);
  return newUser;
};

const updateResetPasswordToken = async (email, token) => {
  const user = await models.User.findOne({ where: { email } });
  if (user) {
    user.reset_password_token = token;
    await user.save();
  }
};

const updateUser = async (id, body) => {
  const user = await models.User.update(body, { where: { id } });
  return user;
};

const deleteUser = async (id) => {
  const user = await models.User.destroy({ where: { id } });
  return user;
};

module.exports = {
  getAllUser,
  getById,
  getByEmail,
  createUser,
  updateResetPasswordToken,
  getByToken,
  updateUser,
  deleteUser,
};
