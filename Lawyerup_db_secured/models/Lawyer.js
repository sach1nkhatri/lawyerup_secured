const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  fullName: String,
  role: {
    type: String,
    enum: ['senior', 'junior'],
    default: 'senior'  // fallback for older entries
  },

  // Contact Info
  email: String,
  phone: String,
  state: String,
  city: String,
  address: String,

  // Senior-specific
  specialization: String,
  qualification: String,
  workExperience: [
    {
      court: String,
      from: String,
      to: String
    }
  ],

  // Junior-specific
  expectedGraduation: String,

  // Common
  profilePhoto: String,     // base64 or URL
  licenseFile: String,      // progress report or license
  schedule: Object,         // { Monday: [{start, end}] }

  description: String,
  specialCase: String,
  socialLink: String,

  education: [
    {
      degree: String,
      institute: String,
      year: String,
      specialization: String
    }
  ],

  status: {
    type: String,
    enum: ['pending', 'verified', 'listed', 'hold', 'rejected', 'disabled'],
    default: 'pending'
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  reviews: [
    {
      user: { type: String, required: true },
      comment: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', lawyerSchema);
