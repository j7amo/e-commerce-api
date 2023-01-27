const express = require('express');
const {
  registerController,
  loginController,
  logoutController,
} = require('../controllers/auth-controller');

const router = express.Router();

router.route('/register').post(registerController);
router.route('/login').post(loginController);
router.route('/logout').post(logoutController);

module.exports = router;
