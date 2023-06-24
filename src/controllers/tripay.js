/** @format */

const axios = require('axios'); // using Axios library
const crypto = require('crypto');

var apiKey = 'DEV-1E32qQGO7FmceagRMhecjo9zGhttmV0tOLbLC8fY';
var privateKey = 'OjOvo-66Swz-ID3yv-ppcMr-vbFdO';

var merchant_code = 'T22987';
var merchant_ref = 'SNC23062210010';
var amount = 1000000;

var expiry = parseInt(Math.floor(new Date() / 1000) + 24 * 60 * 60); // 24 jam

function createSignature(merchant_code, merchant_ref, amount) {
  return crypto
    .createHmac('sha256', privateKey)
    .update(merchant_code + merchant_ref + amount)
    .digest('hex');
}

function createPayload() {
  var payload = {
    method: 'QRIS2',
    merchant_ref: merchant_ref,
    amount: amount,
    customer_name: 'Nama Pelanggan',
    customer_email: 'emailpelanggan@domain.com',
    // customer_phone: '081234567890',
    order_items: [
      {
        name: 'Nama Produk 1',
        price: 500000,
        quantity: 1,
      },
      {
        name: 'Nama Produk 2',
        price: 500000,
        quantity: 1,
      },
    ],
    expired_time: expiry,
    signature: createSignature(merchant_code, merchant_ref, amount),
  };
  return payload;
}

const transactionCreate = async (req, res) => {
  try {
    const result = await axios.post('https://tripay.co.id/api-sandbox/transaction/create', createPayload(), {
      headers: { Authorization: 'Bearer ' + apiKey },
      validateStatus: function (status) {
        return status < 999; // ignore http error
      },
    });
    console.log('hasil', result);
    return res.status(200).json({ message: 'success', data: result.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'internal server error', data: error });
  }
};

module.exports = {
  transactionCreate,
};
