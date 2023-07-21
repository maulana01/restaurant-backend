/** @format */

const express = require('express');
const router = express.Router();

const userController = require('../../controllers/user-controller');

router.get('/', userController.getAllUser);
router.get('/:id', userController.getById);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
