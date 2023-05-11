/** @format */

const express = require('express');
const router = express.Router();

const orderController = require('../../controllers/order-controller');
const { body, param } = require('express-validator');

// router.get('/new-order/:table_number', orderController.getNewOrder);
router.get('/new-order/:device_ids', orderController.getNewOrderByDevice);
router.get('/order/:order_code', orderController.getOrderAndOrderDetail);
router.get('/paid-orders', orderController.allPaidOrders);
router.get('/processed-orders', orderController.allProcessedOrders);
router.get('/finished-orders', orderController.allFinishedOrders);
router.patch('/new-order/:device_ids', orderController.makeAnOrder);
router.patch('/cancel-order/:order_code', orderController.cancelOrder);
router.patch('/pay-order/:order_code', orderController.changeOrderStatusToPaid);
router.patch('/process-order/:order_code', orderController.changeOrderStatusToProcessed);
router.patch('/finish-order/:order_code', orderController.changeOrderStatusToFinished);
router.patch('/close-order/:table_number', orderController.closeOrder);
router.post('/', orderController.initNewOrder);
router.post('/payment/notification', orderController.paymentNotification);

module.exports = router;
