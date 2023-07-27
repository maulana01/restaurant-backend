/** @format */

const argon2 = require('argon2');
const nodemailer = require('nodemailer');
const randomString = require('randomstring');
const { validationResult } = require('express-validator');
const userService = require('../services/user-service');
const welcomeMsgEmailTemplate = require('../utils/welcome-message-email');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sanscocwrkspc@gmail.com',
    pass: 'vdcxnxldhvwvxjkc',
  },
});

const getAllUser = async (req, res) => {
  try {
    const users = await userService.getAllUser();
    return res.status(200).json({ status: 'success', message: 'User list', data: users });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getById(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({ status: 'success', message: 'User detail', data: user });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone_number, role } = req.body;
    const password = randomString.generate({
      length: 10,
      charset: 'alphanumeric',
    });
    const newUser = {
      name,
      email,
      password: await argon2.hash(password),
      phone_number,
      role,
    };
    const validateForm = validationResult(req);
    if (!validateForm.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: validateForm.array() });
    }
    const user = await userService.createUser(newUser);
    if (user) {
      let welcomeMsg = welcomeMsgEmailTemplate(name, email, password);
      const mailOptions = {
        from: 'Sans Co Cafe <sanscocwrkspc@gmail.com>',
        to: user.email,
        subject: 'Welcome to Sans Co Cafe - Your Account Information',
        html: welcomeMsg,
      };
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ status: 'error', message: error.message });
        }
        return res.status(201).json({ status: 'success', message: 'User created' });
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone_number, role, password } = req.body;
    const user = await userService.getById(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const updatedUser = {
      name,
      email,
      phone_number,
      role,
      password: await argon2.hash(password),
    };
    const validateForm = validationResult(req);
    if (!validateForm.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: validateForm.array() });
    }
    const result = await userService.updateUser(id, updatedUser);
    if (result) {
      return res.status(200).json({ status: 'success', message: 'User updated' });
    }
    return res.status(500).json({ status: 'error', message: 'Failed to update user' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.deleteUser(id);
    if (user) {
      return res.status(200).json({ status: 'success', message: 'User deleted' });
    }
    return res.status(404).json({ status: 'error', message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAllUser,
  getById,
  createUser,
  updateUser,
  deleteUser,
};
