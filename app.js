/** @format */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http');
const port = 3000;
const server = http.createServer(app);
const { Server } = require('socket.io');

app.use(cors());

const routes = require('./src/v1/routes');

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('paid-orders', (data) => {
    console.log('paid-orders', data, socket);
    io.emit('paid-orders', data);
  });
  socket.on('error', function (err) {
    console.log(err);
  });
  // socket.on('online', () => {});
});

app.set('io', io);
app.all('/', (req, res) => {
  console.log('Just got a request!');
  res.send('Jalan');
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/v1/menus', routes.menuRoute);
app.use('/api/v1/orders', routes.orderRoute);
server.listen(port, () => console.log('listening on port 3000'));
