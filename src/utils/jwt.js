const jwt = require('jsonwebtoken');

// in previous projects we defined these functionality via Schema "methods"
// objects (we added methods to it), but this time we will extract this functionality to utils
const createJWT = ({ payload }) => jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_LIFETIME,
});

// A LITTLE TRICK:
// 1) make function accept object.
// 2) destructure what we need.
// 3) pass arguments as an object.
// This way we don't need to worry about ORDER OF THE ARGUMENTS.
const isValidToken = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  createJWT,
  isValidToken,
};
