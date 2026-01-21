const Chat = require('../models/chat');

// 📜 Get all chats
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error('Failed to fetch chats:', err.message);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// 📜 Get a single chat
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    console.error('Failed to get chat:', err.message);
    res.status(500).json({ error: 'Failed to get chat' });
  }
};

// ➕ Create a new chat
exports.createChat = async (req, res) => {
  try {
    const newChat = await Chat.create({
      user: req.user._id,
      messages: [],
      title: req.body.title || 'New Chat',
      model: req.body.model || 'gemma-3-12b-it-q4f'
    });
    res.status(201).json(newChat);
  } catch (err) {
    console.error('Failed to create chat:', err.message);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

// ❌ Delete chat
exports.deleteChat = async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error('Failed to delete chat:', err.message);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

exports.sendMessage = async (req, res) => {
  const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
  const { chatId, message, model = 'gemma-3-12b-it-q4f' } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    let chat;

    if (!chatId) {
      chat = await Chat.create({
        user: req.user._id,
        messages: [],
        title: 'New Chat',
        model,
        trialAvailable: true
      });
    } else {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
    }

    // 🚨 LIMIT CHECK — Only for Free Trial plan
    if (req.user.plan === 'Free Trial') {
      if (chat.trialAvailable === false) {
        return res.status(403).json({ error: 'Trial ended. Please upgrade to continue.' });
      }

      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const humanMessagesToday = chat.messages.filter(
        (msg) => msg.role !== 'assistant' && msg.createdAt >= todayMidnight
      );

      if (humanMessagesToday.length >= 5) {
        chat.trialAvailable = false;
        await chat.save();
        return res.status(403).json({ error: 'Daily trial limit reached. Upgrade to continue.' });
      }
    }

    // ✅ Save user message
    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    const promptMessages = [
      { role: "system", content: "You are a helpful Nepali legal advisor." },
      ...chat.messages
    ];

    const aiRes = await fetch('http://localhost:8010/proxy/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: true, messages: promptMessages })
    });

    if (!aiRes.ok || !aiRes.body) {
      const error = await aiRes.text();
      console.error("❌ LLM error:", error);
      return res.status(502).json({ error: 'LLM failed', detail: error });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = aiRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.trim() === 'data: [DONE]') continue;

        if (line.startsWith('data:')) {
          try {
            const json = JSON.parse(line.replace('data: ', ''));
            const token = json.choices?.[0]?.delta?.content;
            if (token) {
              fullText += token;
              res.write(`data: ${JSON.stringify(json)}\n\n`);
              await new Promise(r => setTimeout(r, 8));
            }
          } catch (err) {
            console.warn("⚠️ Malformed chunk:", line);
          }
        }
      }
    }

    // ✅ Save AI response
    chat.messages.push({ role: 'assistant', content: fullText });

    if (chat.title === 'New Chat') {
      const short = message.slice(0, 30);
      chat.title = short.charAt(0).toUpperCase() + short.slice(1);
    }

    await chat.save();
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    console.error('🔥 Streaming error:', err.message);
    res.write(`data: ${JSON.stringify({ error: true, message: err.message })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
};


// ✅ Save full reply from frontend
exports.saveReply = async (req, res) => {
  const { chatId, reply } = req.body;
  const userId = req.user?._id;

  if (!chatId || !reply) {
    return res.status(400).json({ error: 'chatId and reply are required' });
  }

  const chat = await Chat.findOne({ _id: chatId, user: userId });
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  chat.messages.push({ role: 'assistant', content: reply });

  if (chat.title === 'New Chat') {
    const firstUserMsg = chat.messages.find(msg => msg.role === 'user')?.content;
    const autoTitle = (firstUserMsg || reply).slice(0, 30);
    chat.title = autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1);
  }

  await chat.save();
  return res.json({ message: 'Reply saved to chat' });
};

exports.appendUserMessage = async (req, res) => {
  const { chatId, message } = req.body;

  if (!chatId || !message) {
    return res.status(400).json({ error: 'chatId and message are required' });
  }

  try {
    const userId = req.user._id;
    const userPlan = req.user.plan;

    // 🔒 Limit check only for Free Trial users
    if (userPlan === 'Free Trial') {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      // 🧠 Find all chats with today's messages
      const userChats = await Chat.find({
        user: userId,
        model: 'lawai-1.0',
        'messages.createdAt': { $gte: todayMidnight }
      });

      // 🔁 Count all non-assistant messages across all chats
      let messageCountToday = 0;
      userChats.forEach(chat => {
        chat.messages.forEach(msg => {
          if (msg.role !== 'assistant' && msg.createdAt >= todayMidnight) {
            messageCountToday++;
          }
        });
      });

      if (messageCountToday >= 5) {
        // 🚫 Trial ended — lock all relevant chats
        await Chat.updateMany(
          { user: userId, model: 'lawai-1.0' },
          { $set: { trialAvailable: false } }
        );
        return res.status(403).json({
          error: 'Trial limit reached. Please try again after midnight or upgrade your plan.'
        });
      }
    }

    // ✅ Save user message
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    res.json({ message: 'User message added' });
  } catch (err) {
    console.error('❌ Failed to append user message:', err.message);
    res.status(500).json({ error: 'Failed to append message' });
  }
};

// 🚨 Delete all chats for logged-in user
exports.deleteAllChats = async (req, res) => {
  try {
    const result = await Chat.deleteMany({ user: req.user._id });
    res.json({
      message: 'All chats deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('❌ Failed to delete all chats:', err.message);
    res.status(500).json({ error: 'Failed to delete all chats' });
  }
};
