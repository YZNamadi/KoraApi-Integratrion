const { initializePayment }= require('../controllers/transactionController');
const { verifyPayment }= require('../controllers/transactionController');
const express = require('express');
const Router = express.Router();

Router.post('/initialize', initializePayment);
Router.get('/verify', verifyPayment);

module.exports = Router;