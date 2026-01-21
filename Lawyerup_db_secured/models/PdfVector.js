const mongoose = require('mongoose');

const PdfVectorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number], // ← stores OpenAI or LM Studio embedding array
    required: true
  }
}, {
  timestamps: true // createdAt, updatedAt
});

module.exports = mongoose.model('PdfVector', PdfVectorSchema);
