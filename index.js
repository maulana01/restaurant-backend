/** @format */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const routes = require('./src/v1/routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/v1/menus', routes.menuRoute);

app.listen(port, () => console.log('jalan'));
