const { StatusCodes } = require('http-status-codes');
const path = require('path');
const Product = require('../models/Product');
const CustomError = require('../errors');

const getAllProducts = async (req, res) => {
  // If we want to use "populate" when querying for document
  // from "Products" collection then we need additional setup
  // because "Product" model DOES NOT HAVE "reviews" "path"
  // stored in MongoDB in the document. To solve this we need
  // to set up a virtual in the "Product" model(please see the model file).
  const products = await Product.find({}).populate({
    path: 'reviews',
    select: 'rating title comment user',
  });
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const {
    params: { id: productId },
  } = req;
  const product = await Product.findOne({ _id: productId }).populate({
    path: 'reviews',
    select: 'rating title comment user',
  });

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
  // when uploading an image we:
  // 1) check if user attached a file in the first place
  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded');
  }

  const productImage = req.files.image;

  // 2) check if the attached file has correct mimetype (which basically helps
  // us understand if it is an image or not)
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please upload image');
  }

  const maxSize = 1024 * 1024;

  // 3) check filesize (we don't want to allow giant files to be uploaded to the server)
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError('Please upload image smaller 1MB');
  }

  // 4) physically place file to the "/uploads" folder
  await productImage.mv(
    path.resolve(__dirname, `../../public/uploads/${productImage.name}`),
  );

  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
