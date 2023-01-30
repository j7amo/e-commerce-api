const mongoose = require('mongoose');

// Here we need to do something new:
// Because "OrderSchema" has "cartItems" field that is an array
// of cart items(surprise, surprise...) we would like to define a cart item
// separately in order to include it in "OrderSchema" and enable its validation:
const SingleCartItem = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    // subtotal = item quantity * item price (before tax)
    subtotal: {
      type: Number,
      required: true,
    },
    // total = subtotal + taxes + shipping fee
    total: {
      type: Number,
      required: true,
    },
    cartItems: {
      // this basically says that "cartItems" is an array of "SingleCartItem"
      type: [SingleCartItem],
    },
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
      default: 'pending',
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', OrderSchema);
