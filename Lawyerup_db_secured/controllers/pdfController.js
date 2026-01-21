const pdfParse = require('pdf-parse');
const fs = require('fs');
const PdfVector = require('../models/PdfVector');
const Chat = require('../models/chat');
const { getEmbedding } = require('../utils/embeddingHelper');

const splitIntoChunks = (text, max = 500) => {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  const chunks = [];
  let chunk = '';

  for (const s of sentences) {
    if ((chunk + s).length < max) chunk += s;
    else {
      chunks.push(chunk);
      chunk = s;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
};

exports.uploadChatPDF = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const filePath = req.file.path;
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF contains no readable text.');
    }

    const chunks = splitIntoChunks(data.text);

    for (const chunk of chunks) {
      try {
        const embedding = await getEmbedding(chunk);
        if (!embedding || !embedding[0]) throw new Error('Invalid embedding');
        await PdfVector.create({
          user: req.user._id,
          chat: chatId,
          text: chunk,
          embedding
        });
      } catch (embedErr) {
        console.warn('❌ Skipped chunk:', embedErr.message);
        continue;
      }
    }

    res.json({ message: 'PDF uploaded and vectorized successfully', chunks: chunks.length });
  } catch (err) {
    console.error('❌ PDF vectorization failed:', err.message);
    res.status(500).json({ error: 'Failed to upload or process PDF' });
  }
};
