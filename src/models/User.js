const mongoose = require('mongoose');
const validate = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minLength: 3,
    maxLength: 20,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: {
      // we use 3rd party validator instead of mongoose built-in ones
      validator: validate.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 6,
    maxLength: 20,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

module.exports = mongoose.model('User', UserSchema);
