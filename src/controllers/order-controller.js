/** @format */

const orderService = require('../services/order-service');
// const menuService = require('../services/menu-service');

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
};

const initNewOrder = async (req, res) => {
  try {
    const { table_number } = req.body;
    const body = {
      order_code: await generateOrderCode(1, table_number),
      table_number,
      status: 'Menunggu Pelanggan Untuk Memesan',
    };
    if (await orderService.checkWaitingOrder(table_number)) {
      return res.status(400).json({ status: 'error', message: 'Order already exists' });
    }
    await orderService.createOrder(body);
    return res.status(201).json({ status: 'success', message: 'Order created' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const makeAnOrder = async (req, res) => {
  try {
    const { nama, no_hp, pesanan } = req.body;
    const { table_number } = req.params;
    const order = await orderService.getNewOrder(table_number);
    console.log('ini isi order', order);
    let total = 0;
    const orderBody = {
      nama,
      no_hp,
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
    await orderService.makeAnOrder(order.order_code, orderBody);
    return res.status(201).json({ status: 'success', message: 'Order created' });
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

const cancelOrder = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await orderService.getByOrderCode(order_code);
    if (order) {
      await orderService.cancelOrder(order.order_code);
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
      req.app.get('io').emit('paid-orders', await orderService.allPaidOrders());
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
    req.io.emit('processed-orders', () => {});
    console.log('ini order', req.io);
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

module.exports = {
  makeAnOrder,
  initNewOrder,
  getNewOrder,
  cancelOrder,
  getOrderAndOrderDetail,
  getOrderDetailByOrderCode,
  changeOrderStatusToPaid,
};
