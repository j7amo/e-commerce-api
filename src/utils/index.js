// re-export file to make one major import point for consuming code
require('dotenv').config();
const {
  createJWT,
  decodeTokenPayload,
  attachCookiesToResponse,
} = require('./jwt');

module.exports = {
  createJWT,
  decodeTokenPayload,
  attachCookiesToResponse,
};
