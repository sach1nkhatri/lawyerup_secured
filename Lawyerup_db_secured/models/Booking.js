const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 1, min: 1 },
  mode: { type: String, enum: ['online', 'live'], default: 'online' },
  description: { type: String, default: '' },
  meetingLink: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'cancelled'], default: 'pending' },
  reviewed: { type: Boolean, default: false },

  // ✅ NEW: Chat messages stored here
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
      }
    }
  ]
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
