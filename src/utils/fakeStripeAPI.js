/* eslint-disable camelcase */
const fakeStripeAPI = async ({ amount, currency }) => {
  console.log(currency);
  const client_secret = 'someRandomValue';

  return {
    client_secret,
    amount,
  };
};

module.exports = fakeStripeAPI;
