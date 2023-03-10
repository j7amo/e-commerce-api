const { StatusCodes } = require('http-status-codes');
const Review = require('../models/Review');
const Product = require('../models/Product');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllReviews = async (req, res) => {
  // We can use "populate" method to reference data from other collections
  // to show it in the query result.
  // e.g. we can get info about product and/or user when we query for review
  // in the "Reviews" collection. Although in reality 'Reviews' collection
  // DOES NOT HAVE this data stored in it. This data is stored in
  // separate collections: "Products" and "Users". In "Review" model
  // we already have paths that we want to reference ('product', 'user').
  // So in this case we just use "populate" and no additional setup is needed:
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({
      path: 'user',
      select: 'name email role',
    });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id })
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({
      path: 'user',
      select: 'name email role',
    });

  if (!review) {
    throw new CustomError.NotFoundError(
      `No review with id ${req.params.id} found`,
    );
  }

  res.status(StatusCodes.OK).json({ review });
};

const createReview = async (req, res) => {
  // first we check if there is such a product
  const {
    body: { product: productId },
    user: { userId },
  } = req;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(
      `Product with id ${productId} not found`,
    );
  }

  // then we check if the user already submitted a review for this product(because
  // we are nor allowing user to leave more than 1 review per product)
  const reviewAlreadySubmitted = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (reviewAlreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Review for this product already submitted',
    );
  }
  // the request should have all what is required in the Preview schema
  // except for userId (because it comes from "req.user" not from "req.body").
  // so we add it:
  req.body.user = userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const updateReview = async (req, res) => {
  const {
    params: { id: reviewId },
    body: { rating, title, comment },
    user,
  } = req;
  const review = await Review.findOne({ _id: reviewId });
  // check if review exists
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId} found`);
  }
  // before we try to update the existing review we should check user permissions
  // (user must be admin OR the same one who created the review)
  checkPermissions(user, review.user);
  // if user has permissions then we can safely update review
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const {
    params: { id: reviewId },
    user,
  } = req;
  const review = await Review.findOne({ _id: reviewId });
  // check if review exists
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId} found`);
  }
  // before we try to delete the existing review we should check user permissions
  // for deleting of the review (user must be admin OR the same one who created the review)
  checkPermissions(user, review.user);
  // if user has permissions then we can safely delete review
  await review.remove();

  res.status(StatusCodes.OK).json({ msg: 'Review deleted' });
};

const getSingleProductReviews = async (req, res) => {
  const {
    params: { id: productId },
  } = req;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
