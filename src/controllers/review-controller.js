const { StatusCodes } = require('http-status-codes');
const Review = require('../models/Review');

const getAllReviews = async (req, res) => {
  res.status(StatusCodes.OK).send('get all reviews');
};

const getSingleReview = async (req, res) => {
  res.status(StatusCodes.OK).send('get single review');
};

const createReview = async (req, res) => {
  res.status(StatusCodes.CREATED).send('create review');
};

const updateReview = async (req, res) => {
  res.status(StatusCodes.OK).send('update review');
};

const deleteReview = async (req, res) => {
  res.status(StatusCodes.OK).send('delete review');
};

module.exports = {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
};
