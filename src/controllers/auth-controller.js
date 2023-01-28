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

  // 2) Another option is to use COOKIES.
  // Main POINTS about them are:
  // - cookie is MORE SECURE way of storing token because it is NOT ACCESSIBLE via JS(if we
  // set up the "httpOnly" flag), which makes cookie data LESS VULNERABLE THAN "localStorage"
  // data to JavaScript-based attacks.
  // - we don't have to set up JS code on the client for storing/retrieving token
  // from "localStorage" because IT'S BROWSER's WORK now. IMPORTANT: it works only for the
  // (1)SAME DOMAIN AND (2)SAME PORT SIMULTANEOUSLY - if PORTS and/or DOMAINS
  // of the server and client are different, then such a request from the client will not contain
  // cookies! In our case we have a client written with the help of Create React App.
  // And in order to fix this cookies issue we can use one of CRA features: "PROXYING".
  // In order to use it we just add "proxy": "http://localhost:3333" to client's "package.json".
  // Keep in mind that this is a viable option ONLY FOR DEVELOPMENT!
  // After app is deployed to some hosting service then we need to use the service documentation
  // on how to set up the PROXYING/REDIRECTING.
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
  // When user logs out we need to set 'token' cookie value to some value
  // that will not match anymore (it will not hold token anymore).
  // We can go here with ANY string value literally:
  res.cookie('token', 'logout', {
    // we can set it to expire instantly (or we can do something like Date.now() + 5000)
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({ msg: 'logout' });
};

module.exports = {
  registerController,
  loginController,
  logoutController,
};
