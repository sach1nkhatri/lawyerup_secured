// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g., "July 2025"
  year: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },

  free: { type: Number, default: 0 },
  basic: {
    total: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  premium: {
    total: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  registeredUsers: { type: Number, default: 0 },
  lawyers: {
    total: { type: Number, default: 0 },
    junior: { type: Number, default: 0 },
    senior: { type: Number, default: 0 }
  },
  reports: { type: Number, default: 0 },

  isFinalized: { type: Boolean, default: false }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
