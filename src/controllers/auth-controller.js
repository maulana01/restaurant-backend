/** @format */

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const userService = require('../services/user-service');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password.',
    });
  } else {
    const user = await userService.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email or password is incorrect.',
      });
    }

    const verifyPassword = await argon2.verify(user.password, password);

    if (!verifyPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Password salah. Coba lagi atau klik Lupa Password untuk mereset password Anda.',
      });
    }

    const token = jwt.sign(
      {
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || 'rahasia',
      {
        expiresIn: '20h',
      }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login Berhasil',
      data: {
        token,
      },
    });
  }
};

module.exports = {
  login,
};
