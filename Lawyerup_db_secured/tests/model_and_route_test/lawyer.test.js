const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Lawyer = require('../../models/Lawyer');

let token, userId, lawyerId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Lawyer.deleteMany();

  // Register a user
  const res = await request(app).post('/api/auth/signup').send({
    fullName: 'Lawyer User',
    email: 'lawyer@example.com',
    password: 'test123',
    contactNumber: '9999999999'
  });
  userId = res.body.user.id;

  const login = await request(app).post('/api/auth/login').send({
    email: 'lawyer@example.com',
    password: 'test123'
  });
  token = login.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('⚖️ Lawyer Routes', () => {
  it('should create a new lawyer application', async () => {
    const lawyerData = {
      fullName: 'Lawyer User',
      specialization: 'Civil Law',
      email: 'lawyer@example.com',
      phone: '9999999999',
      state: 'Bagmati',
      city: 'Kathmandu',
      address: 'Somewhere',
      qualification: 'LLB',
      profilePhoto: 'photo.jpg',
      licenseFile: 'license.pdf',
      description: 'Experienced lawyer',
      specialCase: 'None',
      socialLink: 'https://linkedin.com/lawyer',
      education: JSON.stringify([
        { degree: 'LLB', institute: 'Law School', year: '2020', specialization: 'Civil Law' }
      ]),
      workExperience: JSON.stringify([
        { court: 'Supreme Court', from: '2020', to: '2024' }
      ]),
      schedule: JSON.stringify({
        Monday: [{ start: '10:00', end: '12:00' }]
      })
    };

    const res = await request(app)
      .post('/api/lawyers')
      .set('Authorization', `Bearer ${token}`)
      .field(lawyerData); // uses `.field()` to send as form-data

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    lawyerId = res.body._id;
  });


  it('should update lawyer status to verified', async () => {
    const res = await request(app)
      .patch(`/api/lawyers/${lawyerId}/status`)
      .send({ status: 'verified' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('verified');
  });

  it('should update lawyer profile info', async () => {
    const res = await request(app)
      .put(`/api/lawyers/${lawyerId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'Updated bio') // simulate form-data
      .field('education', JSON.stringify([
        { degree: 'LLB', institute: 'New Law School', year: '2021', specialization: 'Criminal Law' }
      ]))
      .field('workExperience', JSON.stringify([]))
      .field('schedule', JSON.stringify({ Monday: [] }));

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Updated bio');
  });

  it('should fetch all lawyers (admin/public)', async () => {
    const res = await request(app).get('/api/lawyers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should delete the lawyer application', async () => {
    const res = await request(app)
      .delete(`/api/lawyers/${lawyerId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});
