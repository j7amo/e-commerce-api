const { StatusCodes } = require('http-status-codes');

const getAllProducts = async (req, res) => {
  res.status(StatusCodes.OK).send('get all products');
};

const getSingleProduct = async (req, res) => {
  res.status(StatusCodes.OK).send('get single product');
};

const createProduct = async (req, res) => {
  res.status(StatusCodes.CREATED).send('create product');
};

const updateProduct = async (req, res) => {
  res.status(StatusCodes.OK).send('update product');
};

const deleteProduct = async (req, res) => {
  res.status(StatusCodes.OK).send('delete product');
};

const uploadImage = async (req, res) => {
  res.status(StatusCodes.OK).send('image uploaded');
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
