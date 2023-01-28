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
const decodeTokenPayload = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, tokenPayload }) => {
  const token = createJWT({ payload: tokenPayload });
  const oneDay = 3600000 * 24;

  res.cookie('token', token, {
    expires: new Date(Date.now() + oneDay),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};

module.exports = {
  createJWT,
  decodeTokenPayload,
  attachCookiesToResponse,
};
