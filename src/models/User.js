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
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

UserSchema.pre('save', async function () {
  // this check helps us to avoid unnecessary password re-hashing,
  // because if we re-hash password on every document save, then
  // after just one of such re-hashes credentials will not match anymore
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePasswords = async function (passwordCandidate) {
  const isMatch = await bcrypt.compare(passwordCandidate, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
