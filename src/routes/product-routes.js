const express = require('express');
const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('../controllers/product-controller');
const { getSingleProductReviews } = require('../controllers/review-controller');
const {
  authenticationMiddleware,
  authorizePermissions,
} = require('../middleware/authentication');

const router = express.Router();

router
  .route('/')
  .get(getAllProducts)
  .post(authenticationMiddleware, authorizePermissions('admin'), createProduct);

router
  .route('/uploadImage')
  .post(authenticationMiddleware, authorizePermissions('admin'), uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch(authenticationMiddleware, authorizePermissions('admin'), updateProduct)
  .delete(
    authenticationMiddleware,
    authorizePermissions('admin'),
    deleteProduct,
  );

router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
