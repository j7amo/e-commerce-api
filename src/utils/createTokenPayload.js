const createTokenPayload = (user) => ({
  // eslint-disable-next-line no-underscore-dangle
  userId: user._id,
  name: user.name,
  role: user.role,
});

module.exports = createTokenPayload;
