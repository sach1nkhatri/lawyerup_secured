const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server'); // Adjust if app is exported from another file
const User = require('../../models/User');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany(); // Clear user collection for clean test
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Auth API', () => {
  const dummyUser = {
    fullName: 'Test User',
    email: 'testuser@example.com',
    password: 'test123',
    contactNumber: '1234567890'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(dummyUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('email', dummyUser.email);
    expect(res.body).toHaveProperty('token');
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: dummyUser.email,
        password: dummyUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', dummyUser.email);
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .patch('/api/auth/update-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated User',
        city: 'Kathmandu'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('fullName', 'Updated User');
  });
});
