const express = require('express');
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/user-controller');
const authenticateUser = require('../middleware/authentication');

const router = express.Router();

router.route('/').get(authenticateUser, getAllUsers);
router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
// Keep in mind that the ORDER here is IMPORTANT:
// if we put any of the previous 3 routes
// below the "/:id" then we will not be able to access those resources.
// Why? Because e.g. a request to "/api/v1/users/showMe":
// 1) will match "/:id".
// 2) "id" path param will have a value of "showMe".
// 3) 99% that we will not be able to find a user with such an ID.
router.route('/:id').get(getSingleUser);

module.exports = router;
