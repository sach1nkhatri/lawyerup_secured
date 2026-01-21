const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
  model: { type: String, default: 'lawai-1.0' },
  trialAvailable: { type: Boolean, default: true }, 
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Chat', chatSchema);
