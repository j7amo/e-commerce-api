const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const CustomError = require('../errors/index');
const {
  createTokenPayload,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

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
  // We don't want to allow anybody to randomly access any user he wants.
  // So the user can get a user by ID only if he is:
  // - an admin
  // - OR he is trying to get himself
  // eslint-disable-next-line no-underscore-dangle
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const {
    body: { name, email },
    user: { userId },
  } = req;

  if (!name || !email) {
    throw new CustomError.BadRequestError('Please provide name and email');
  }

  // We have 2 options to UPDATE user:

  // 1) We can go with "User.findOneAndUpdate".
  const user = await User.findOneAndUpdate(
    // filter
    { _id: userId },
    // pass update
    { name, email },
    // run validators before updating and return updated document
    { new: true, runValidators: true },
  ).select('-password');

  // 2) We can go with "user.save"
  // const user = await User.findOne({ _id: userId });
  // user.email = email;
  // user.name = name;
  // await user.save();

  // What option should we choose? It depends on what we need.
  // But keep in mind that there is a GOTCHA here:
  // If we go with OPTION 1 - PRE-SAVE HOOK IS NOT INVOKED
  // If we go with OPTION 2 - PRE-SAVE HOOK IS INVOKED

  const tokenPayload = createTokenPayload(user);
  attachCookiesToResponse({ res, tokenPayload });

  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword },
    user: { userId },
  } = req;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      'Please provide old and new password',
    );
  }

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new CustomError.NotFoundError(`User with id ${userId} not found`);
  }

  const isCorrectPassword = await user.comparePasswords(oldPassword);

  if (!isCorrectPassword) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  // we can just simply assign a new password here (even if it is not hashed)
  // because we have a "pre-save" hook that does all the hashing work
  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Password updated!' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
