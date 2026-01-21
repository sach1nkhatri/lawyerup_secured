const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Lawyer = require('../../models/Lawyer');
const Booking = require('../../models/Booking');

let token, userId, lawyerId, lawyerListId, bookingId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Booking.deleteMany();
  await Lawyer.deleteMany();

  // Register + login user
  const userRes = await request(app).post('/api/auth/signup').send({
    fullName: 'Booking User',
    email: 'booking@example.com',
    password: 'test123',
    contactNumber: '9876543210'
  });
  userId = userRes.body.user.id;

  const login = await request(app).post('/api/auth/login').send({
    email: 'booking@example.com',
    password: 'test123'
  });
  token = login.body.token;

  // Create lawyer (same user for test)
  const lawyer = await Lawyer.create({
    user: userId,
    fullName: 'Lawyer Test',
    specialization: 'Family Law',
    qualification: 'LLB',
    contact: '123456789',
    phone: '1234567890',
    rate: 100,
    profilePhoto: 'default.jpg',
    schedule: {
      Monday: [{ start: '10:00', end: '12:00' }]
    }
  });

  lawyerId = lawyer._id;
  lawyerListId = lawyer._id;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('📅 Booking Routes', () => {
  it('should create a booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: userId,
        lawyer: lawyerId,
        lawyerList: lawyerListId,
        date: '2025-08-01',
        time: '10:00',
        duration: 1,
        mode: 'online',
        description: 'Test Booking'
      });

    if (res.statusCode !== 201) {
      console.error('❌ Booking creation error:', res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    bookingId = res.body._id;
    expect(bookingId).toBeDefined();
  });

  it('should fetch bookings for user', async () => {
    const res = await request(app)
      .get(`/api/bookings/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch bookings for lawyer', async () => {
    const res = await request(app)
      .get(`/api/bookings/lawyer/${lawyerId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update booking status', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('should add meeting link', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/meeting-link`)
      .set('Authorization', `Bearer ${token}`)
      .send({ meetingLink: 'https://meet.google.com/test-meeting' });

    expect(res.statusCode).toBe(200);
    expect(res.body.meetingLink).toBeDefined();
  });

  it('should get available slots', async () => {
    const res = await request(app)
      .get(`/api/bookings/slots?lawyerId=${lawyerId}&date=2025-08-01&duration=1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should send a chat message', async () => {
    const res = await request(app)
      .post(`/api/bookings/${bookingId}/chat`)
      .set('Authorization', `Bearer ${token}`)
      .send({ senderId: userId, text: 'Hello Lawyer' });

    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe('Hello Lawyer');
  });

  it('should fetch chat messages', async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingId}/chat`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should mark messages as read', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/chat/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Messages marked as read');
  });

  it('should delete the booking', async () => {
    const res = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});
