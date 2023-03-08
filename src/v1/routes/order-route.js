/** @format */

const express = require('express');
const router = express.Router();

const orderController = require('../../controllers/order-controller');
const { body, param } = require('express-validator');

router.get('/new-order/:table_number', orderController.getNewOrder);
router.get('/order/:order_code', orderController.getOrderAndOrderDetail);
router.put('/new-order/:table_number', orderController.makeAnOrder);
router.put('/cancel-order/:order_code', orderController.cancelOrder);
router.put('/pay-order/:order_code', orderController.changeOrderStatusToPaid);
router.post('/', orderController.initNewOrder);

module.exports = router;
