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

module.exports = mongoose.model('Review', ReviewSchema);
