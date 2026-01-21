const Chat = require('../models/chat');

const resetChatTrials = async () => {
  try {
    const result = await Chat.updateMany(
      { model: 'lawai-1.0' },
      { $set: { trialAvailable: true } }
    );
    console.log(`✅ Reset ${result.modifiedCount} chats`);
  } catch (err) {
    console.error('❌ Failed to reset trials:', err.message);
  }
};

module.exports = resetChatTrials;
