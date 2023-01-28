// re-export file to make one major import point for consuming code
require('dotenv').config();
const { createJWT, isValidToken, attachCookiesToResponse } = require('./jwt');

module.exports = {
  createJWT,
  isValidToken,
  attachCookiesToResponse,
};
