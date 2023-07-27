/** @format */

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomString = require('randomstring');
const userService = require('../services/user-service');
const forgotPasswordEmailTemplate = require('../utils/forgot-password-email');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sanscocwrkspc@gmail.com',
    pass: 'vdcxnxldhvwvxjkc',
  },
});

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
        message: 'User tidak terdaftar.',
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
        id: user.id,
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email.',
    });
  } else {
    const user = await userService.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User tidak terdaftar.',
      });
    }

    const resetPasswordToken = randomString.generate({
      length: 64,
      charset: 'alphanumeric',
    });

    await userService.updateResetPasswordToken(email, resetPasswordToken);

    let forgotPassword = forgotPasswordEmailTemplate(user.name, email, resetPasswordToken);
    const mailOptions = {
      from: 'Sans Co Cafe <sanscocwrkspc@gmail.com>',
      to: email,
      subject: 'Lupa Password?',
      html: forgotPassword,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ status: 'error', message: error.message });
      }
      return res.status(200).json({ status: 'success', message: 'Reset password link has been sent to your email.' });
    });
  }
};

const checkTokenReset = async (req, res) => {
  const { token } = req.params;

  const user = await userService.getByToken(token);

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Token tidak valid.',
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Token valid.',
    email: user.email,
  });
};

const resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Token Sudah tidak valid.',
    });
  }
  if (!password || !confirmPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Tolong masukkan password baru dan konfirmasi password baru.',
    });
  } else {
    const user = await userService.getByEmail(email);

    if (password !== confirmPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Password tidak sama.',
      });
    }

    const hashedPassword = await argon2.hash(password);
    user.password = hashedPassword;
    user.reset_password_token = null;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah.',
    });
  }
};

module.exports = {
  login,
  forgotPassword,
  checkTokenReset,
  resetPassword,
};
