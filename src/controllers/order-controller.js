/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const Order = require('../models/Order');
const Product = require('../models/Product');
const CustomError = require('../errors');
const { checkPermissions, fakeStripeAPI } = require('../utils');

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const {
    params: { id: orderId },
    user,
  } = req;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`Order with id ${orderId} not found`);
  }

  checkPermissions(user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const {
    user: { userId },
  } = req;

  const orders = await Order.find({ user: userId });

  if (!orders || orders.length < 1) {
    throw new CustomError.NotFoundError(
      `Orders for user with id ${userId} not found`,
    );
  }

  res.status(StatusCodes.OK).json({ orders });
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  // throw an error if cart is empty
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }

  // throw an error if the user did something to tax/shipping fee
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee',
    );
  }

  // create identifiers that will be used for holding values from the for-of loop iterations
  let orderItems = [];
  let subtotal = 0;

  // Now for every item in the cart we want to:
  // 1) Check if there is such a product in the DB
  // eslint-disable-next-line no-restricted-syntax
  for (const item of cartItems) {
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findOne({ _id: item.product });

    if (!product) {
      throw new CustomError.NotFoundError(
        `Product with id ${item.product} not found`,
      );
    }

    // extract all the important values from the DB (we should never
    // 100% trust frontend, because users can tamper with data if skilled enough),
    // so that we are 100% certain about these values
    const {
      name, price, image, _id,
    } = product;

    // then we prepare a single cart item with correct values (because we pulled them from DB)
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // populate containers
    orderItems = [...orderItems, singleOrderItem];
    subtotal += price * item.amount;
  }

  // calculate total
  const total = tax + shippingFee + subtotal;
  // communicate with Stripe (in our case we will fake it)
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  });

  // and finally we can create Order document
  const order = await Order.create({
    cartItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const {
    params: { id: orderId },
    body: { paymentIntentId },
    user,
  } = req;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`Order with id ${orderId} not found`);
  }

  checkPermissions(user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
