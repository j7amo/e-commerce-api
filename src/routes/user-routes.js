const express = require('express');
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/user-controller');
const {
  authenticationMiddleware: authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const router = express.Router();

// We want to grant the permission to get all users to ADMIN ONLY.
// In order to do it we use additional middleware for this resource.
router
  .route('/')
  // IMPORTANT: the order of middlewares matters. We want "authorizePermissions"
  // go after "authenticateUser". Why? Because "authorizePermissions" needs
  // a "user" property on "req" object. And "authenticateUser" middleware
  // does add this property if token is valid.
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers);
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
router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;
