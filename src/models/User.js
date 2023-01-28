const mongoose = require('mongoose');
const validate = require('validator');
const bcrypt = require('bcryptjs');

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

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePasswords = async function (passwordCandidate) {
  const isMatch = await bcrypt.compare(passwordCandidate, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
