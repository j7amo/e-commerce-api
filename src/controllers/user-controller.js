const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const CustomError = require('../errors/index');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId }).select('-password');

  if (!user) {
    throw new CustomError.NotFoundError(`User with id ${userId} not found!`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({});
  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  res.json(req.body.name);
};

const updateUserPassword = async (req, res) => {
  res.json(req.body.password);
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
