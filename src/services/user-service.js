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

module.exports = {
  getAllUser,
  getByEmail,
  createUser,
  updateResetPasswordToken,
  getByToken,
};
