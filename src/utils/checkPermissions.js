const CustomError = require('../errors/index');
/**
 * Function checks user permission to access user resource.
 * @param requestUser - the user who makes the request
 * @param resourceUserId - the userId that user is trying get
 */
const checkPermissions = (requestUser, resourceUserId) => {
  const { userId, role } = requestUser;

  if (role === 'admin' || userId === resourceUserId.toString()) return;

  throw new CustomError.UnauthorizedError(
    'Not authorized to access this resource',
  );
};

module.exports = checkPermissions;
