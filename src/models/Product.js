const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      minLength: 5,
      maxLength: [100, 'Product name cannot be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      minLength: 5,
      maxLength: [
        1000,
        'Product description cannot be more than 1000 characters',
      ],
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg',
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      // we can set up enums 2 ways:
      // 1)
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: [true, 'Please provide product company'],
      // 2)
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported!',
      },
    },
    colors: {
      type: [String],
      default: ['#222'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  // here we enable virtuals
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// VIRTUAL SETUP:
// We want to set up connection between "Product" and "Review" models so that
// when we query product we can also get all the reviews for it. In order to do it
// we can use Mongoose virtuals. In Mongoose, a virtual is a property that is
// NOT STORED(which helps us to avoid duplication of data) IN MongoDB but computed on-the-fly.
ProductSchema.virtual('reviews', {
  // we reference the model we want to set up connection to
  ref: 'Review',
  // we set up the connection between "localField" of the Product model
  localField: '_id',
  // and "foreignField" of the Review model
  foreignField: 'product',
  // we say that we want results in an array form
  justOne: false,
  // we can also add additional filters
  // match: { rating: 5 },
});

// set up "PRE-REMOVE" HOOK for removal of all the reviews associated with this product:
ProductSchema.pre('remove', async function () {
  // eslint-disable-next-line no-underscore-dangle
  await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', ProductSchema);
