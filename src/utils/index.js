// re-export file to make one major import point for consuming code
require('dotenv').config();
const {
  createJWT,
  decodeTokenPayload,
  attachCookiesToResponse,
} = require('./jwt');
const createTokenPayload = require('./createTokenPayload');
const checkPermissions = require('./checkPermissions');
const fakeStripeAPI = require('./fakeStripeAPI');

module.exports = {
  createJWT,
  decodeTokenPayload,
  attachCookiesToResponse,
  createTokenPayload,
  checkPermissions,
  fakeStripeAPI,
};
