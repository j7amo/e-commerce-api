// re-export file to make one major import point for consuming code
require('dotenv').config();
const { createJWT, isValidToken } = require('./jwt');

module.exports = {
  createJWT,
  isValidToken,
};
