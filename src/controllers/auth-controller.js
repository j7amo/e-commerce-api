const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/index');
const User = require('../models/User');
const { createJWT } = require('../utils/index');

const registerController = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyInUse = await User.findOne({ email });

  if (emailAlreadyInUse) {
    throw new CustomError.BadRequestError('Email already in use!');
  }

  // By NOT passing "req.body" to "User.create" we avoid a situation
  // when someone creates a request via Postman and explicitly sends
  // { "role": "admin" } when registering a user.
  // So basically we have multiple ways of dealing with it:
  // 1) We can assign an "admin" role via MongoDB directly.
  // 2) If we want only one user to be an admin then we can check if we have no users
  // in the DB and agree on making the first one to register - an ADMIN:
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // eslint-disable-next-line no-underscore-dangle
  const tokenPayload = { userId: user._id, name: user.name, role: user.name };

  const token = createJWT({ payload: tokenPayload });

  res.status(StatusCodes.CREATED).json({ user: tokenPayload, token });
};

const loginController = async (req, res) => {
  res.status(StatusCodes.OK).send('login');
};

const logoutController = async (req, res) => {
  res.status(StatusCodes.OK).send('logout');
};

module.exports = {
  registerController,
  loginController,
  logoutController,
};
