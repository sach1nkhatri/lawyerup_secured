const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Lawyer = require('../../models/Lawyer');
const Booking = require('../../models/Booking');

let user, token, lawyerUser, lawyer, booking;

beforeAll(async () => {
  // Just clean data — no need to reconnect
  await User.deleteMany({});
  await Lawyer.deleteMany({});
  await Booking.deleteMany({});

  user = await User.create({
    fullName: 'User Tester',
    email: 'user@example.com',
    password: '12345678',
    role: 'user',
    contactNumber: '9800000001' 
  });
  


  const res = await request(app).post('/api/auth/login').send({
    email: 'user@example.com',
    password: '12345678',
  });
  token = res.body.token;

  lawyerUser = await User.create({
    fullName: 'Lawyer Tester',
    email: 'lawyer@example.com',
    password: '12345678',
    role: 'lawyer',
    contactNumber: '9800000002' 
  });
  lawyer = await Lawyer.create({
    user: lawyerUser._id,
    fullName: 'Lawyer Tester',
    specialization: 'Criminal Law',
    reviews: [],
  });

  booking = await Booking.create({
    user: user._id,
    lawyer: lawyerUser._id,
    lawyerList: lawyer._id,
    date: new Date(),
    time: '10:00',
    duration: '1',
    mode: 'online',
    description: 'Test booking',
    status: 'completed',
    reviewed: false,
    chat: [],
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase(); // Only do this once
  await mongoose.disconnect(); // Proper disconnect
});

describe('⭐ Review Submission', () => {
  it('should submit a review for a completed booking', async () => {
    const res = await request(app)
      .post(`/api/reviews/${booking._id}`)
      .send({
        user: user._id.toString(),
        comment: 'Excellent service!',
        rating: 5,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Review submitted successfully ✅');

    const updatedLawyer = await Lawyer.findById(lawyer._id);
    expect(updatedLawyer.reviews.length).toBe(1);
    expect(updatedLawyer.reviews[0].comment).toBe('Excellent service!');
    expect(updatedLawyer.reviews[0].rating).toBe(5);
  });
});
