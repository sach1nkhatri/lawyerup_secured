const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const speakeasy = require('speakeasy');

let authToken;
let mfaToken;
let testUser;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany(); // Clear user collection for clean test
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('MFA (Multi-Factor Authentication) API', () => {
  const dummyUser = {
    fullName: 'MFA Test User',
    email: 'mfatest@example.com',
    password: 'test123',
    contactNumber: '1234567890'
  };

  // Setup: Register and login user
  beforeAll(async () => {
    // Register user
    await request(app)
      .post('/api/auth/signup')
      .send(dummyUser);

    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: dummyUser.email,
        password: dummyUser.password
      });

    authToken = loginRes.body.token;
    testUser = await User.findOne({ email: dummyUser.email });
  });

  describe('POST /api/auth/mfa/setup', () => {
    it('should generate TOTP secret and QR code', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('otpauth_url');
      expect(res.body).toHaveProperty('qrCodeDataUrl');
      expect(res.body).toHaveProperty('secret');
    });

    it('should return error if MFA already enabled', async () => {
      // First enable MFA (mock)
      const user = await User.findById(testUser._id);
      user.mfaEnabled = true;
      user.mfaSecret = 'TEST_SECRET';
      await user.save();

      const res = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already enabled');

      // Reset for other tests
      user.mfaEnabled = false;
      user.mfaSecret = null;
      await user.save();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/setup');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/mfa/confirm', () => {
    let tempSecret;

    beforeEach(async () => {
      // Setup MFA first
      const setupRes = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      const user = await User.findById(testUser._id).select('+mfaTempSecret');
      tempSecret = user.mfaTempSecret;
    });

    it('should confirm MFA setup with valid TOTP code', async () => {
      // Generate valid TOTP code
      const code = speakeasy.totp({
        secret: tempSecret,
        encoding: 'base32'
      });

      const res = await request(app)
        .post('/api/auth/mfa/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('recoveryCodes');
      expect(res.body.recoveryCodes).toHaveLength(8);
      expect(res.body.message).toContain('enabled');
    });

    it('should reject invalid TOTP code', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '000000' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });

    it('should require code', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/confirm')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login with MFA enabled', () => {
    beforeEach(async () => {
      // Enable MFA for test user
      const user = await User.findById(testUser._id);
      user.mfaEnabled = true;
      user.mfaSecret = speakeasy.generateSecret().base32;
      await user.save();
    });

    it('should return mfaRequired and mfaToken when MFA is enabled', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: dummyUser.email,
          password: dummyUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mfaRequired', true);
      expect(res.body).toHaveProperty('mfaToken');
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('email');

      mfaToken = res.body.mfaToken;
    });

    it('should return normal token when MFA is disabled', async () => {
      // Disable MFA
      const user = await User.findById(testUser._id);
      user.mfaEnabled = false;
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: dummyUser.email,
          password: dummyUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).not.toHaveProperty('mfaRequired');

      // Re-enable for other tests
      user.mfaEnabled = true;
      await user.save();
    });
  });

  describe('POST /api/auth/mfa/verify', () => {
    let userSecret;

    beforeEach(async () => {
      // Ensure MFA is enabled with a known secret
      const secret = speakeasy.generateSecret();
      userSecret = secret.base32;
      const user = await User.findById(testUser._id);
      user.mfaEnabled = true;
      user.mfaSecret = userSecret;
      await user.save();

      // Get mfaToken from login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: dummyUser.email,
          password: dummyUser.password
        });
      mfaToken = loginRes.body.mfaToken;
    });

    it('should verify valid TOTP code and return access token', async () => {
      const code = speakeasy.totp({
        secret: userSecret,
        encoding: 'base32'
      });

      const res = await request(app)
        .post('/api/auth/mfa/verify')
        .send({
          mfaToken,
          code
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject invalid TOTP code', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/verify')
        .send({
          mfaToken,
          code: '000000'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should require mfaToken', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/verify')
        .send({ code: '123456' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/mfa/disable', () => {
    beforeEach(async () => {
      // Ensure MFA is enabled
      const secret = speakeasy.generateSecret();
      const user = await User.findById(testUser._id);
      user.mfaEnabled = true;
      user.mfaSecret = secret.base32;
      await user.save();
    });

    it('should disable MFA with password and valid TOTP code', async () => {
      const user = await User.findById(testUser._id).select('+mfaSecret');
      const code = speakeasy.totp({
        secret: user.mfaSecret,
        encoding: 'base32'
      });

      const res = await request(app)
        .post('/api/auth/mfa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: dummyUser.password,
          code
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('disabled');

      // Verify MFA is actually disabled
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.mfaEnabled).toBe(false);
    });

    it('should require password', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '123456' });

      expect(res.statusCode).toBe(400);
    });
  });
});

