import request from 'supertest';
import app from '../src/app';

describe('Auth', () => {
  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'wrong', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should login with default admin creds from env', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });
});
