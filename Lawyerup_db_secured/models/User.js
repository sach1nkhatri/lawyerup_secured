const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'lawyer', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    default: 'Free Trial'
  },

  status: {
    type: String,
    enum: ['verified', 'hold', 'disable'],
    default: 'verified',
  },
  

//complete profile section
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  }

}, { timestamps: true });



module.exports = mongoose.model('User', userSchema);
