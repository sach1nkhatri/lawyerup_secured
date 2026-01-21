const express = require('express');
const router = express.Router();

const ai = require('../controllers/aiController');
const pdf = require('../controllers/pdfController'); // ✅ import your PDF controller
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Existing chat/AI routes...
router.get('/chats', authMiddleware, ai.getChats);
router.get('/chats/:id', authMiddleware, ai.getChatById);
router.post('/chats', authMiddleware, ai.createChat);
router.delete('/chats/all', authMiddleware, ai.deleteAllChats); 
router.delete('/chats/:id', authMiddleware, ai.deleteChat);

router.post('/send', authMiddleware, ai.sendMessage);
router.post('/saveReply', authMiddleware, ai.saveReply);
router.post('/appendUserMessage', authMiddleware, ai.appendUserMessage);



// ✅ NEW: Upload PDF to specific chat → parse + embed
router.post(
  '/upload/chatpdf/:chatId',
  authMiddleware,
  upload.single('chatpdf'),  // fieldname must be `chatpdf` in formData
  pdf.uploadChatPDF
);


module.exports = router;
