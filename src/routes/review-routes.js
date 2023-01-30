const express = require('express');
const {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/review-controller');
const { authenticationMiddleware } = require('../middleware/authentication');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(authenticationMiddleware, createReview);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticationMiddleware, updateReview)
  .delete(authenticationMiddleware, deleteReview);

module.exports = router;
