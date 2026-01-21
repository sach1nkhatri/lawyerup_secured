const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Basic Plan', 'Premium Plan', 'Trial Plan'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['eSewa', 'Khalti', 'IME', 'Bank'],
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  duration: {
    type: String // e.g., "Daily", "Weekly", "Monthly"
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
