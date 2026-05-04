/**
 * Tests de usuarios - GET /api/users/:userId,
 *                     POST /api/users/:id/block, GET /api/users/blocked
 *
 * Usa mongodb-memory-server (via setup.js) y supertest.
 * Construye una mini-app de Express para evitar dependencias opcionales.
 */

const request = require('supertest');
const express = require('express');
const { protect } = require('../middleware/auth');
const { register } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController');
const {
  blockUser,
  unblockUser,
  getBlockedUsers
} = require('../controllers/userBlockController');

let app;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret_kronos';

  app = express();
  app.use(express.json());

  // Auth endpoint
  app.post('/api/auth/register', register);

  // Users endpoints - el orden importa: /blocked antes de /:userId
  app.get('/api/users/blocked', protect, getBlockedUsers);
  app.post('/api/users/:id/block', protect, blockUser);
  app.delete('/api/users/:id/block', protect, unblockUser);
  app.get('/api/users/:userId', getUserProfile);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const registerUser = async (suffix = '') => {
  const userData = {
    username: `user${suffix}`,
    email: `user${suffix}@kronos.com`,
    password: 'Password123',
    firstName: 'Test',
    lastName: `User${suffix}`
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(userData);

  return {
    token: res.body.token,
    userId: res.body.user.id,
    user: res.body.user
  };
};

// ─── GET /api/users/:userId ───────────────────────────────────────────────────

describe('GET /api/users/:userId', () => {
  it('deberia devolver el perfil publico de un usuario existente - 200', async () => {
    const { userId } = await registerUser('prof1');

    const res = await request(app)
      .get(`/api/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user._id).toBe(userId);
  });

  it('deberia devolver 404 si el usuario no existe', async () => {
    const fakeId = '64a0f0f0f0f0f0f0f0f0f0f0';

    const res = await request(app)
      .get(`/api/users/${fakeId}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/users/:id/block ────────────────────────────────────────────────

describe('POST /api/users/:id/block', () => {
  it('deberia bloquear a un usuario y devolver 201 con exito', async () => {
    const { token } = await registerUser('block1');
    const { userId: targetId } = await registerUser('block2');

    const res = await request(app)
      .post(`/api/users/${targetId}/block`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Spam' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/blocked/i);
  });

  it('deberia devolver 400 si el usuario intenta bloquearse a si mismo', async () => {
    const { token, userId } = await registerUser('block3');

    const res = await request(app)
      .post(`/api/users/${userId}/block`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot block yourself/i);
  });

  it('deberia devolver 400 si el usuario ya esta bloqueado', async () => {
    const { token } = await registerUser('block4');
    const { userId: targetId } = await registerUser('block5');

    // Primer bloqueo
    await request(app)
      .post(`/api/users/${targetId}/block`)
      .set('Authorization', `Bearer ${token}`);

    // Segundo bloqueo (duplicado)
    const res = await request(app)
      .post(`/api/users/${targetId}/block`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already blocked/i);
  });

  it('deberia devolver 401 si no hay token al intentar bloquear', async () => {
    const { userId: targetId } = await registerUser('block6');

    const res = await request(app)
      .post(`/api/users/${targetId}/block`);

    expect(res.status).toBe(401);
  });
});

// ─── GET /api/users/blocked ───────────────────────────────────────────────────

describe('GET /api/users/blocked', () => {
  it('deberia listar los usuarios bloqueados por el usuario autenticado - 200', async () => {
    const { token } = await registerUser('blist1');
    const { userId: target1 } = await registerUser('blist2');
    const { userId: target2 } = await registerUser('blist3');

    // Bloquear dos usuarios
    await request(app)
      .post(`/api/users/${target1}/block`)
      .set('Authorization', `Bearer ${token}`);

    await request(app)
      .post(`/api/users/${target2}/block`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/users/blocked')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.blockedUsers)).toBe(true);
    expect(res.body.blockedUsers.length).toBe(2);
    expect(res.body.total).toBe(2);
  });

  it('deberia devolver lista vacia si el usuario no ha bloqueado a nadie', async () => {
    const { token } = await registerUser('blist4');

    const res = await request(app)
      .get('/api/users/blocked')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.blockedUsers).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('deberia devolver 401 si no hay token al pedir la lista de bloqueados', async () => {
    const res = await request(app)
      .get('/api/users/blocked');

    expect(res.status).toBe(401);
  });
});
