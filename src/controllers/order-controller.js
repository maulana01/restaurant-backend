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
const axios = require('axios'); // using Axios library
const moment = require('moment/moment');

/*==================== TRIPAY CONFIG ====================*/
// const apiKey = 'DEV-1E32qQGO7FmceagRMhecjo9zGhttmV0tOLbLC8fY';
// const privateKey = 'OjOvo-66Swz-ID3yv-ppcMr-vbFdO';
const apiKey = '6n1sye6oNYCjjed4tqATuMjtGTHblGKzp01AbhA0';
const privateKey = 'BYY97-6KXJL-1BbUT-Cdz5w-ir0X5';

// const merchant_code = 'T22987';
const merchant_code = 'T23528';

const expiry = parseInt(Math.floor(new Date() / 1000) + 24 * 60 * 60); // 24 jam
/*==================== TRIPAY CONFIG ====================*/

/*==================== DOKU PAYMENT GATEWAY ====================*/
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
/*==================== DOKU PAYMENT GATEWAY ====================*/

/*==================== TRIPAY PAYMENT GATEWAY ====================*/
function createSignature(merchant_code, merchant_ref, amount) {
  return crypto
    .createHmac('sha256', privateKey)
    .update(merchant_code + merchant_ref + amount)
    .digest('hex');
}

const transactionCreate = async (payload, apiKey) => {
  try {
    const result = await axios.post('https://tripay.co.id/api/transaction/create', payload, {
      headers: { Authorization: 'Bearer ' + apiKey },
      validateStatus: function (status) {
        return status < 999; // ignore http error
      },
    });
    console.log('hasil', result);
    return result;
    // return res.status(200).json({ message: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    // return res.status(500).json({ message: 'internal server error', data: error });
  }
};

/*==================== TRIPAY PAYMENT GATEWAY ====================*/

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

const getListSort = (sort) => {
  const sortingFields = sort.split(',');
  const storeSort = {};
  // Now you can process each sorting field (e.g., order_code and payment_method)
  for (const field of sortingFields) {
    const [fieldName, sortOrder] = field.split('=');

    // Here, "fieldName" will be the name of the field (e.g., "order_code")
    // and "sortOrder" will be either "ASC" or "DESC"
    console.log(fieldName, sortOrder);
    storeSort[fieldName] = sortOrder;
  }
  return storeSort;
};

const getListFilter = (filter) => {
  const filteringFields = filter.split(',');
  const storeFilter = {};
  // Now you can process each filtering field (e.g., order_code and payment_method)
  for (const field of filteringFields) {
    const [fieldName, filterOrder] = field.split('=');
    const [filterOrder1, filterOrder2] = filterOrder.split('.');

    // Here, "fieldName" will be the name of the field (e.g., "order_code")
    // and "filterOrder" will be either "ASC" or "DESC"
    console.log(fieldName, filterOrder);
    storeFilter[fieldName] = {
      operation: filterOrder1,
      value: filterOrder2,
    };
  }
  return storeFilter;
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
    let tripayOrderItems = [];
    await Promise.all(
      pesanan.map(async (item) => {
        let sub = item.qty * item.price;
        const orderDetailBody = {
          order_id: order.id,
          menu_id: item.menu_id,
          qty: item.qty,
          price: item.price,
        };
        const menu = await menuService.getById(item.menu_id);
        tripayOrderItems.push({
          name: menu.name,
          price: item.price,
          quantity: item.qty,
        });
        total += sub;
        orderService.createOrderDetail(orderDetailBody);
      })
    );
    orderBody.payment_amount = total;

    const payloadTripay = {
      merchant_ref: order.order_code,
      amount: total,
      customer_name: name,
      customer_email: 'emailpelanggan@domain.com',
      // customer_phone: '081234567890',
      order_items: tripayOrderItems,
      expired_time: expiry,
      signature: createSignature(merchant_code, order.order_code, total),
    };

    if (payment_method == 'briva') {
      /*======================================= payment gateway =======================================*/
      payloadTripay.method = 'BRIVA';
      const result = await transactionCreate(payloadTripay, apiKey);

      if (result.status == 200 || result.status == 201) {
        orderBody.virtual_account_number = result.data.data.pay_code;
        orderBody.payment_expired_date = moment.unix(result.data.data.expired_time).format('YYYYMMDDHHmmss');
        await req.app.get('io').emit('get-va', {
          virtual_account_number: result.data.data.pay_code,
          amount: total,
          expired_date: moment.unix(result.data.data.expired_time).format('YYYYMMDDHHmmss'),
        });
        // console.log('ini isi orderbody', orderBody);
        await orderService.makeAnOrder(order.order_code, orderBody);
        // console.log('ini hasil save order', saveOrder);
      }
      /*======================================= payment gateway =======================================*/
    } else if (payment_method == 'cash') {
      await orderService.makeAnOrder(order.order_code, orderBody);
    } else if (payment_method == 'qris') {
      payloadTripay.method = 'QRIS2';
      const result = await transactionCreate(payloadTripay, apiKey);

      console.log('statuskode', result.status);
      console.log('qr_url', result.data.data.qr_url);
      console.log('pay_code', result.data.data.pay_code);
      console.log('expired_time', result.data.data.expired_time);

      if (result.status == 200 || result.status == 201) {
        orderBody.qr_url = result.data.data.qr_url;
        orderBody.payment_expired_date = moment.unix(result.data.data.expired_time).format('YYYYMMDDHHmmss');
        await req.app.get('io').emit('get-qris', {
          qr_url: result.data.data.qr_url,
          amount: total,
          expired_date: moment.unix(result.data.data.expired_time).format('YYYYMMDDHHmmss'),
        });
        console.log('ini isi orderbody', orderBody);
        await orderService.makeAnOrder(order.order_code, orderBody);
        // console.log('ini hasil save order', saveOrder);
      }
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

/*================== DOKU PAYMENT NOTIFICATION ==================*/
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
/*================== DOKU PAYMENT NOTIFICATION ==================*/

/*================== TRIPAY PAYMENT NOTIFICATION ==================*/
const tripayPaymentNotification = async (req, res) => {
  try {
    let json = JSON.stringify(req.body);
    let signature = crypto.createHmac('sha256', privateKey).update(json).digest('hex');
    let jsonObj = JSON.parse(json);
    // console.log(signature);
    // console.log(jsonObj);
    // console.log('order_code', jsonObj.merchant_ref);
    // console.log('headers', req.headers['x-callback-signature']);
    if (signature !== req.headers['x-callback-signature']) {
      return res.status(400).json({ success: false, message: 'Signature not match' });
    } else {
      const order = await orderService.getByOrderCode(jsonObj.merchant_ref);
      if (order) {
        await orderService.changeOrderStatusToPaid(order.order_code);
        req.app.get('io').emit('pay-order', await orderService.getPaidOrderByOrderCode(order.order_code));
        req.app.get('io').emit('update-status-order', { status: 'Pesanan Sudah Dibayar' });
        return res.status(200).json({ success: true, message: 'Order status changed' });
      } else {
        return res.status(400).json({ success: false, message: 'Order not found' });
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/*================== TRIPAY PAYMENT NOTIFICATION ==================*/

const getAllOrders = async (req, res) => {
  try {
    const { page, limit, search, sort, filter } = req.query;
    // console.log('ini filter', getListFilter(filter));
    // const { startDate, endDate } = getListFilter(filter);
    // console.log('ini tipe data', typeof JSON.stringify(startDate));
    // const convertStartDate = moment(JSON.stringify(startDate), 'YYYY-MM-DD HH:mm:ss').startOf('day').unix();
    // const convertEndDate = moment(JSON.stringify(endDate), 'YYYY-MM-DD HH:mm:ss').endOf('day').unix();
    // return res.status(200).json({ status: 'success', message: convertStartDate });
    if (search) {
      if (search == '') {
        return res.status(200).json({ status: 'success', message: 'Search is empty' });
      } else {
        const orders = await orderService.getAllOrders(page, limit, search, '', filter ? getListFilter(filter) : '');
        // console.log(orders);
        return res.status(200).json({
          status: 'success',
          data: orders,
          current_page: page,
          total_pages: Math.ceil(orders.count / limit),
          total_items: orders.rows.length,
          search,
          ...(filter ? { filter: getListFilter(filter) } : {}),
        });
      }
    } else {
      const orders = await orderService.getAllOrders(page, limit, '', sort ? getListSort(sort) : '', filter ? getListFilter(filter) : '');
      // console.log(orders);
      return res.status(200).json({
        status: 'success',
        data: orders,
        current_page: page,
        total_pages: Math.ceil(orders.count / limit),
        total_items: orders.rows.length,
        ...(sort ? { sortBy: getListSort(sort) } : {}),
        ...(filter ? { filter: getListFilter(filter) } : {}),
      });
    }
    // return res.status(200).json({ status: 'success', message: 'sa' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message, line: error.stack });
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
  tripayPaymentNotification,
  getAllOrders,
};
