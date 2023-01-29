const { decodeTokenPayload } = require('../utils');
const CustomError = require('../errors');
// Authentication middleware should be used BEFORE user tries to
// make a request to a protected resource.
// This middleware should do several things:
// - check if the token is present in the cookies in the first place;
// - otherwise throw an error;
// - check if the password from the decrypted token matches the one
// stored in the DB for this user (so basically it checks if the token is valid);
// - otherwise throw an error;
// - if the token is valid then attach token payload to "req" object for future use in
// controllers that are protected by this middleware.
const authenticationMiddleware = async (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }

  // we need to use "try-catch" because "decodeTokenPayload" uses "jwt.verify"
  // under the hood and this method will throw an error if token is incorrect
  try {
    const { userId, name, role } = decodeTokenPayload({ token });
    req.user = { userId, name, role };
    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

// We want to grant the permission to access some resources to a specific group of users.
// In order to do it we use additional middleware for these resources.
// As our application grows bigger we may have more roles in the future(e.g. 'owner' etc.).
// So we can make "authorizePermissions" more dynamic to support it. It will help us
// to grant permissions to different groups of users, like so:
// authorizePermissions('admin', 'owner') for DELETE '/auth/v1/users/:id'
// authorizePermissions('analyst') for GET '/auth/v1/users' etc.
// In order to do it we set up a function that returns another function
// so that it can be invoked by Express:
const authorizePermissions = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to access this resource',
    );
  }
  next();
};

module.exports = {
  authenticationMiddleware,
  authorizePermissions,
};
