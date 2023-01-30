/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide a title'],
      minLength: 5,
      maxLength: 30,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      minLength: 5,
      maxLength: 100,
    },
    user: {
      type: mongoose.Types.ObjectId,
      // Set the model that this path refers to
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      // Set the model that this path refers to
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true },
);
// If we want to make sure that the user can leave ONLY ONE review PER PRODUCT,
// then we need to set up compound index:
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// to set up static method on the Schema (we'll need it in the hooks) we
// add it to "statics" property, and later we can access it
// via "this.constructor.calculateAverageRating"
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // By the way: we can generate and get this code snippet at MongoDB Atlas:
  // https://cloud.mongodb.com/v2/63cce1b1a9fba43ffd6cb170#/metrics/replicaSet/63cce30f5d84a65d0a098d1f/explorer/E-COMMERCE-API/reviews/aggregation
  const result = await this.aggregate([
    // 1st stage is matching all the reviews for the current product
    {
      $match: { product: productId },
    },
    // 2nd stage is grouping
    {
      $group: {
        _id: '$product', // or we can use null here in this case instead of '$product'
        // we calculate "averageRating" by using Mongo's "$avg" operator
        // and "rating" property of the matched documents
        averageRating: { $avg: '$rating' },
        // and we increment by 1 with the help of Mongo's "$sum" operator
        // on every document matched
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Product').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      },
    );
  } catch (err) {
    console.log(err);
  }
};

// Here we want to set up additional functionality on save/remove of a review:
// - change "numOfReviews" value in "Product" document;
// - change "averageRating" value in "Product" document.
// For this we can use "POST-SAVE" and "POST-REMOVE" hooks that are
// triggered AFTER the actions (on the contrary with "PRE" hook):
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
