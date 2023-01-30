const { StatusCodes } = require('http-status-codes');
const path = require('path');
const Order = require('../models/Order');
const CustomError = require('../errors');

const getAllOrders = async (req, res) => {
  res.status(StatusCodes.OK).send('get all orders');
};

const getSingleOrder = async (req, res) => {
  res.status(StatusCodes.OK).send('get single order');
};

const getCurrentUserOrders = async (req, res) => {
  res.status(StatusCodes.OK).send('get current user orders');
};

const createOrder = async (req, res) => {
  res.status(StatusCodes.CREATED).send('create order');
};

const updateOrder = async (req, res) => {
  res.status(StatusCodes.OK).send('update order');
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
