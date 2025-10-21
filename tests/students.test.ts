import request from 'supertest';
import app from '../src/app';

function randEmail() {
  return `student_${Date.now()}_${Math.floor(Math.random()*10000)}@example.com`;
}

describe('Students CRUD + CSV', () => {
  let token = '';
  let createdId = '';

  it('login as admin to get JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    token = res.body.access_token;
  });

  it('create student', async () => {
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        full_name: 'Test Student',
        faculty: 'Engineering',
        group: 'SE-99',
        email: randEmail(),
        phone: '+998911112233',
        birth_date: '2002-01-15',
        enrollment_year: 2020,
        status: 'active',
      });
    expect(res.status).toBe(201);
    createdId = res.body.id;
    expect(createdId).toBeTruthy();
  });

  it('list students with pagination', async () => {
    const res = await request(app).get('/api/v1/students?page=1&limit=5&sort=full_name');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('get student by id', async () => {
    const res = await request(app).get(`/api/v1/students/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('update student', async () => {
    const res = await request(app)
      .patch(`/api/v1/students/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'graduated' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'graduated');
  });

  it('export CSV (public)', async () => {
    const res = await request(app).get('/api/v1/students/export.csv');
    expect(res.status).toBe(200);
    expect(res.type).toMatch(/text\/csv/);
    expect(res.text.split('\n')[0]).toContain('full_name');
  });

  it('delete student', async () => {
    const res = await request(app)
      .delete(`/api/v1/students/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
