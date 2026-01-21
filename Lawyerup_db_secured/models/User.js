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
  },

  // Multi-Factor Authentication (MFA) fields
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  // TOTP secret (base32 encoded) - stored in plain text for now
  // TODO: Consider encrypting this field in production for enhanced security
  mfaSecret: {
    type: String,
    default: null,
    select: false // Never return in queries unless explicitly requested
  },
  // Temporary secret used only during MFA setup flow
  mfaTempSecret: {
    type: String,
    default: null,
    select: false
  },
  // Recovery codes (hashed) - one-time use codes for account recovery
  mfaRecoveryCodes: [{
    type: String, // Hashed recovery codes
    select: false
  }]

}, { timestamps: true });



module.exports = mongoose.model('User', userSchema);
