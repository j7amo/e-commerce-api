const express = require('express');

const router = express.Router();
const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/order-controller');
const {
  authenticationMiddleware,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .get(authenticationMiddleware, authorizePermissions('admin'), getAllOrders)
  .post(authenticationMiddleware, createOrder);

router
  .route('/showAllMyOrders')
  .get(authenticationMiddleware, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticationMiddleware, getSingleOrder)
  .patch(authenticationMiddleware, updateOrder);

module.exports = router;
