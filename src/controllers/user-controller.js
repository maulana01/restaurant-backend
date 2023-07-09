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

module.exports = {
  getAllUser,
  createUser,
};
