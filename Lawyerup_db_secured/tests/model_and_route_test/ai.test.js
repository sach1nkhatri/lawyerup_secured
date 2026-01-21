const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Chat = require('../../models/chat');

let token;
let chatId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Chat.deleteMany();

  // Create + login user
  const user = {
    fullName: 'Test AI User',
    email: 'aiuser@example.com',
    password: 'test123',
    contactNumber: '1234567890'
  };

  await request(app).post('/api/auth/signup').send(user);
  const res = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password
  });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('🧠 AI Chat Routes', () => {
  it('should create a new chat', async () => {
    const res = await request(app)
      .post('/api/ai/chats')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Test Chat' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('title', 'My Test Chat');
    chatId = res.body._id;
  });

  it('should fetch all chats for the user', async () => {
    const res = await request(app)
      .get('/api/ai/chats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch a chat by ID', async () => {
    const res = await request(app)
      .get(`/api/ai/chats/${chatId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', chatId);
  });

  it('should append a user message', async () => {
    const res = await request(app)
      .post('/api/ai/appendUserMessage')
      .set('Authorization', `Bearer ${token}`)
      .send({ chatId, message: 'Hello AI!' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User message added');
  });

  it('should save an assistant reply', async () => {
    const res = await request(app)
      .post('/api/ai/saveReply')
      .set('Authorization', `Bearer ${token}`)
      .send({ chatId, reply: 'Hello Human!' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Reply saved to chat');
  });

  it('should delete a single chat', async () => {
    const res = await request(app)
      .delete(`/api/ai/chats/${chatId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Chat deleted');
  });

  it('should delete all chats', async () => {
    // create two dummy chats
    for (let i = 0; i < 2; i++) {
      await request(app)
        .post('/api/ai/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: `Chat ${i + 1}` });
    }

    const res = await request(app)
      .delete('/api/ai/chats/all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('deletedCount');
  });
});
