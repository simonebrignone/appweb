// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');

// Mock sendEmail
jest.mock('../../utils/sendEmail', () => jest.fn(() => Promise.resolve()));

describe('Auth API', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const wrongPassword = 'WrongPassword123!';
  let refreshToken;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Test',
        surname: 'User'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail to register a user with an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Test',
        surname: 'User'
      });
    expect(res.statusCode).toEqual(400);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    refreshToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: wrongPassword,
      });
    expect(res.statusCode).toEqual(400);
  });

  it('should fail login with non-existing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testPassword,
      });
    expect(res.statusCode).toEqual(400);
  });

  it('should request forgot password successfully', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });
    expect(res.statusCode).toBe(200);
  });

  it('should fail forgot password with non-existing email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.statusCode).toBe(404);
  });

  it('should fail refresh token without cookie', async () => {
    const res = await request(app)
      .get('/api/auth/refresh-token');
    expect(res.statusCode).toEqual(401);
  });

  it('should refresh access token with valid refresh token', async () => {
    const res = await request(app)
      .get('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout');
    expect(res.statusCode).toEqual(200);
  });
});