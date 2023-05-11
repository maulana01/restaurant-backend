/** @format */

const orderService = require('../services/order-service');
const menuService = require('../services/menu-service');
const http = require('node:http');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { curly } = require('node-libcurl');
const fs = require('fs');
const path = require('path');
const tls = require('tls');

const generateDigest = (jsonBody) => {
  let jsonStringHash256 = crypto.createHash('sha256').update(jsonBody, 'utf-8').digest();

  let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
  return bufferFromJsonStringHash256.toString('base64');
};

const generateSignature = (clientId, requestId, requestTimestamp, requestTarget, digest, secret) => {
  // Prepare Signature Component
  // console.log('----- Component Signature -----');
  let componentSignature = 'Client-Id:' + clientId;
  componentSignature += '\n';
  componentSignature += 'Request-Id:' + requestId;
  componentSignature += '\n';
  componentSignature += 'Request-Timestamp:' + requestTimestamp;
  componentSignature += '\n';
  componentSignature += 'Request-Target:' + requestTarget;
  // If body not send when access API with HTTP method GET/DELETE
  if (digest) {
    componentSignature += '\n';
    componentSignature += 'Digest:' + digest;
  }

  // console.log(componentSignature.toString());
  // console.log();

  // Calculate HMAC-SHA256 base64 from all the components above
  let hmac256Value = crypto.createHmac('sha256', secret).update(componentSignature.toString()).digest();

  let bufferFromHmac256Value = Buffer.from(hmac256Value);
  let signature = bufferFromHmac256Value.toString('base64');
  // Prepend encoded result with algorithm info HMACSHA256=
  return 'HMACSHA256=' + signature;
};

const generateOrderCode = async (i = 1, table_number) => {
  const getDate = new Date();
  let code = 'SNC'.concat(
    getDate.getFullYear().toString().substr(-2),
    0,
    getDate.getMonth() + 1,
    getDate.getDate() < 10 ? '0' + getDate.getDate() : getDate.getDate()
  );
  const lastOrderCode = await orderService.getAllByOrderCode(code);
  let lastNumber = 1;
  if (lastOrderCode) {
    lastNumber = lastOrderCode.toString().substr(lastOrderCode.order_code, -5);
    lastNumber += i;
  }
  code = code.concat(table_number, lastNumber.toString().padStart(4, '0'));
  let cek = await orderService.checkOrderCodeIfExists(code);
  if (!cek) {
    return code;
  } else {
    return generateOrderCode(i + 1, table_number);
  }
  // output : SNC23040220001 (SNC + YY + MM + DD + table_number + 0001 Increment)
};

const initNewOrder = async (req, res) => {
  try {
    const { table_number, device_ids } = req.body;
    const body = {
      order_code: await generateOrderCode(1, table_number),
      table_number,
      status: 'Menunggu Pelanggan Untuk Memesan',
      served: false,
      device_ids,
    };
    if (await orderService.checkExistOrderUnlessClosedAndCanceled(table_number)) {
      return res.status(400).json({ status: 'error', message: 'Order already exists' });
    }
    await orderService.createOrder(body);
    req.app.get('io').emit('init-order', {});
    return res.status(201).json({ status: 'success', message: 'Order created' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const makeAnOrder = async (req, res) => {
  try {
    const {
      name,
      // phone_number,
      payment_method,
      pesanan,
    } = req.body;
    const { device_ids } = req.params;
    const order = await orderService.getNewOrderByDevice(device_ids);
    // console.log('ini isi order', order);
    let total = 0;
    const orderBody = {
      name,
      // phone_number,
      payment_method,
      status: 'Menunggu Pembayaran',
    };
    pesanan.map((item) => {
      let sub = item.qty * item.price;
      const orderDetailBody = {
        order_id: order.id,
        menu_id: item.menu_id,
        qty: item.qty,
        price: item.price,
      };
      total += sub;
      orderService.createOrderDetail(orderDetailBody);
    });
    orderBody.payment_amount = total;

    if (payment_method == 'briva') {
      /*======================================= payment gateway =======================================*/
      const dateTime = new Date().toISOString();
      const dateTimeFinal = dateTime.substr(0, 19) + 'Z';
      const generateUUID = uuidv4();

      // Generate Digest from JSON Body, For HTTP Method GET/DELETE don't need generate Digest
      // console.log('----- Digest -----');
      let jsonBody = JSON.stringify({
        order: {
          invoice_number: order.order_code,
          amount: total,
        },
        virtual_account_info: {
          expired_time: 60,
          reusable_status: true,
          // info1: 'Sans Co. Cafe & Coworking Space',
        },
        customer: {
          name,
        },
      });
      let digest = await generateDigest(jsonBody);
      // console.log(digest);
      // console.log();

      // Generate Header Signature
      let headerSignature = await generateSignature(
        'BRN-0266-1659477749505',
        generateUUID,
        dateTimeFinal,
        '/bri-virtual-account/v2/payment-code', // For merchant request to Jokul, use Jokul path here. For HTTP Notification, use merchant path here
        digest, // Set empty string for this argumentes if HTTP Method is GET/DELETE
        'SK-UUxKZAxwFqbg0CozrPkY'
      );

      const certFilePath = path.join(__dirname, '../../cacert.pem');

      const { data, statusCode, headers } = await curly.post('https://api-sandbox.doku.com/bri-virtual-account/v2/payment-code', {
        httpHeader: [
          'Content-Type: application/json',
          'Client-Id: BRN-0266-1659477749505',
          `Request-Id: ${generateUUID}`,
          `Request-Timestamp: ${dateTimeFinal}`,
          `Signature: ${headerSignature}`,
        ],
        postFields: jsonBody,
        caInfo: certFilePath,
      });

      console.log('ini hasil request doku', data);
      console.log('ini hasil request statuscode doku', statusCode);
      console.log('ini hasil request headers doku', headers);

      if (statusCode == 200 || statusCode == 201) {
        orderBody.virtual_account_number = data.virtual_account_info.virtual_account_number;
        orderBody.payment_expired_date = data.virtual_account_info.expired_date;
        await req.app.get('io').emit('get-va', {
          virtual_account_number: data.virtual_account_info.virtual_account_number,
          amount: total,
          expired_date: data.virtual_account_info.expired_date,
        });
        // console.log('ini isi orderbody', orderBody);
        await orderService.makeAnOrder(order.order_code, orderBody);
        // console.log('ini hasil save order', saveOrder);
      }
      /*======================================= payment gateway =======================================*/
    } else if (payment_method == 'cash') {
      await orderService.makeAnOrder(order.order_code, orderBody);
    }

    return res.status(201).json({ status: 'success', message: 'Order created' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const closeOrder = async (req, res) => {
  try {
    const { table_number } = req.params;
    const order = await orderService.getFinishedOrderByTableNumber(table_number);
    if (order) {
      await orderService.closeOrder(order.order_code);
      req.app.get('io').emit('close-or-cancel', {});
      return res.status(200).json({ status: 'success', message: 'Order closed' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const getNewOrder = async (req, res) => {
  try {
    const { table_number } = req.params;
    const order = await orderService.getNewOrder(table_number);
    return res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const getNewOrderByDevice = async (req, res) => {
  try {
    const { device_ids } = req.params;
    const order = await orderService.getNewOrderByDevice(device_ids);
    if (order) {
      const orderDetail = await orderService.getOrderDetail(order.id);
      return res.status(200).json({ status: 'success', data: { Pesanan: order, 'Detail Pesanan': orderDetail } });
      // return res.status(200).json({ status: 'success', data: order });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    if (order) {
      await orderService.cancelOrder(order.order_code);
      req.app.get('io').emit('close-or-cancel', {});
      return res.status(200).json({ status: 'success', message: 'Order canceled' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const changeOrderStatusToPaid = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    if (order) {
      await orderService.changeOrderStatusToPaid(order.order_code);
      req.app.get('io').emit('pay-order', await orderService.getPaidOrderByOrderCode(order_code));
      req.app.get('io').emit('update-status-order', { status: 'Pesanan Sudah Dibayar' });
      return res.status(200).json({ status: 'success', message: 'Order status changed' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const getOrderAndOrderDetail = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    if (order) {
      const orderDetail = await orderService.getOrderDetail(order.id);
      return res.status(200).json({ status: 'success', data: { Pesanan: order, 'Detail Pesanan': orderDetail } });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const getOrderDetailByOrderCode = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    // req.io.emit('processed-orders', () => {});
    // console.log('ini order', req.io);
    if (order) {
      const orderDetail = await orderService.getOrderDetail(order.id);
      return res.status(200).json({ status: 'success', data: orderDetail });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const allPaidOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllPaidOrders();
    return res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const changeOrderStatusToProcessed = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    if (order) {
      await orderService.changeOrderStatusToProcessed(order.order_code);
      req.app.get('io').emit('processed-orders', await orderService.getProcessedOrderByOrderCode(order_code));
      req.app.get('io').emit('update-status-order', { status: 'Pesanan Sedang Diproses' });
      return res.status(200).json({ status: 'success', message: 'Order status changed' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const allProcessedOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllProcessedOrders();
    return res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const changeOrderStatusToFinished = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    if (order) {
      await orderService.changeOrderStatusToFinished(order.order_code);
      req.app.get('io').emit('finished-orders', await orderService.getFinishedOrderByOrderCode(order_code));
      req.app.get('io').emit('update-status-order', { status: 'Pesanan Selesai' });
      return res.status(200).json({ status: 'success', message: 'Order status changed' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const allFinishedOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllFinishedOrders();
    return res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const paymentNotification = async (req, res) => {
  try {
    let getHeaders = req.headers;
    let getBody = req.body;
    const notificationPath = '/api/v1/orders/payment/notification';
    let digest = generateDigest(JSON.stringify(getBody, null, 2));
    let signature = generateSignature(
      getHeaders['client-id'],
      getHeaders['request-id'],
      getHeaders['request-timestamp'],
      notificationPath,
      digest,
      'SK-UUxKZAxwFqbg0CozrPkY'
    );

    // console.log('ini headers signature', getHeaders.signature);
    // console.log('ini generate signature', signature);
    if (signature !== getHeaders.signature) {
      return res.status(400).json({ status: 'error', message: 'Signature not match' });
    } else {
      const order = await orderService.getByOrderCode(getBody.order.invoice_number);
      if (order) {
        await orderService.changeOrderStatusToPaid(order.order_code);
        req.app.get('io').emit('pay-order', await orderService.getPaidOrderByOrderCode(order.order_code));
        req.app.get('io').emit('update-status-order', { status: 'Pesanan Sudah Dibayar' });
        return res.status(200).json({ status: 'success', message: 'Order status changed' });
      } else {
        return res.status(400).json({ status: 'error', message: 'Order not found' });
      }
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  makeAnOrder,
  initNewOrder,
  getNewOrder,
  getNewOrderByDevice,
  cancelOrder,
  getOrderAndOrderDetail,
  getOrderDetailByOrderCode,
  changeOrderStatusToPaid,
  allPaidOrders,
  changeOrderStatusToProcessed,
  allProcessedOrders,
  changeOrderStatusToFinished,
  allFinishedOrders,
  closeOrder,
  paymentNotification,
};
