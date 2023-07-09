/** @format */

const models = require('../../models');

const getAllUser = async () => {
  const users = await models.User.findAll({ order: [['name', 'ASC']] });
  return users.map((user) => user.dataValues);
};

const getByEmail = async (email) => {
  const user = await models.User.findOne({ where: { email } });
  return user;
};

const createUser = (body) => {
  const newUser = models.User.create(body);
  return newUser;
};

module.exports = {
  getAllUser,
  getByEmail,
  createUser,
};
