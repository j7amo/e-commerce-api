const { StatusCodes } = require('http-status-codes');
const Product = require('../models/Product');
const CustomError = require('../errors');

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const {
    params: { id: productId },
  } = req;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(
      `No product with id ${productId} found`,
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const createProduct = async (req, res) => {
  // Product schema has a "user" field that should have an ObjectId value
  // pointing to the user who created the product (in our case it's admin).
  // So before creating a product we need to add this property to "req.body"
  // because initially we don't have it there. And because of "authMiddleware"
  // we have it on "req.user":
  req.body.user = req.user.userId;
  // now when we have a complete object to be used for document creation we pass it:
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const updateProduct = async (req, res) => {
  const {
    params: { id: productId },
  } = req;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(
      `No product with id ${productId} found`,
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const {
    params: { id: productId },
  } = req;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(
      `No product with id ${productId} found`,
    );
  }

  await product.remove();

  res.status(StatusCodes.OK).json({ msg: 'Product removed' });
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
