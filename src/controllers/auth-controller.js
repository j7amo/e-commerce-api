const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/index');
const User = require('../models/User');
const { attachCookiesToResponse } = require('../utils/index');

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
  const tokenPayload = { userId: user._id, name: user.name, role: user.role };

  // const token = createJWT({ payload: tokenPayload });

  // when sending back the token we have 2 major options:
  // 1) We send the token via JSON to be used by JavaScript on the client.
  // Which basically means that it will be taken and stored in the "localStorage":

  // res.status(StatusCodes.CREATED).json({ user: tokenPayload, token });

  // 2) Another option is to use cookies. Which is a more secure way of
  // storing the token. We can straight away set expiration time,
  // access by HTTP only (which means that cookie is not stored/accessed via JS so
  // this makes cookie data less vulnerable than localStorage data to JavaScript-based attacks.):
  attachCookiesToResponse({ res, tokenPayload });

  res.status(StatusCodes.CREATED).json({ user: tokenPayload });
};

const loginController = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const isPasswordCorrect = await user.comparePasswords(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid password');
  }

  // eslint-disable-next-line no-underscore-dangle
  const tokenPayload = { userId: user._id, name: user.name, role: user.role };
  attachCookiesToResponse({ res, tokenPayload });

  res.status(StatusCodes.OK).send({ user: tokenPayload });
};

const logoutController = async (req, res) => {
  res.status(StatusCodes.OK).send('logout');
};

module.exports = {
  registerController,
  loginController,
  logoutController,
};
