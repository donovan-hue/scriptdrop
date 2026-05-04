/**
 * Tests de autenticacion - POST /api/auth/register, /api/auth/login, GET /api/auth/profile
 *
 * Usa mongodb-memory-server (via setup.js) y supertest para HTTP requests.
 * Se construye una mini-app de Express con las rutas necesarias para evitar
 * cargar dependencias opcionales (passport-google, passport-facebook, socket.io, etc.)
 */

const request = require('supertest');
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getProfile
} = require('../controllers/authController');

// Construir app minima con solo las rutas de auth que necesitamos testear
let app;

beforeAll(() => {
  // JWT_SECRET necesario para firmar/verificar tokens
  process.env.JWT_SECRET = 'test_jwt_secret_kronos';

  app = express();
  app.use(express.json());

  // Montar solo los endpoints que se van a testear
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.get('/api/auth/profile', protect, getProfile);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const registerUser = (data = {}) => {
  const defaults = {
    username: 'testuser',
    email: 'test@kronos.com',
    password: 'Password123',
    firstName: 'Test',
    lastName: 'User'
  };
  return request(app)
    .post('/api/auth/register')
    .send({ ...defaults, ...data });
};

const loginUser = (email = 'test@kronos.com', password = 'Password123') => {
  return request(app)
    .post('/api/auth/login')
    .send({ email, password });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('deberia registrar un nuevo usuario y devolver 201 con token', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@kronos.com');
    expect(res.body.user.username).toBe('testuser');
    // La password NO debe exponerse en la respuesta
    expect(res.body.user.password).toBeUndefined();
  });

  it('deberia devolver 400 si el email ya esta registrado', async () => {
    // Primer registro exitoso
    await registerUser();

    // Segundo intento con el mismo email (diferente username)
    const res = await registerUser({ username: 'otrouser' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('deberia devolver 400 si el username ya esta registrado', async () => {
    // Primer registro exitoso
    await registerUser();

    // Segundo intento con el mismo username (diferente email)
    const res = await registerUser({ email: 'otro@kronos.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Crear usuario para los tests de login
    await registerUser();
  });

  it('deberia devolver 200 con JWT si las credenciales son correctas', async () => {
    const res = await loginUser();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('test@kronos.com');
  });

  it('deberia devolver 401 si la password es incorrecta', async () => {
    const res = await loginUser('test@kronos.com', 'WrongPassword');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('deberia devolver 401 si el email no existe', async () => {
    const res = await loginUser('noexiste@kronos.com', 'Password123');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('deberia devolver 400 si no se proporciona password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@kronos.com' });

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/auth/profile ────────────────────────────────────────────────────

describe('GET /api/auth/profile', () => {
  let validToken;

  beforeEach(async () => {
    // Registrar y obtener token
    const res = await registerUser();
    validToken = res.body.token;
  });

  it('deberia devolver 200 con el perfil del usuario si el token es valido', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@kronos.com');
  });

  it('deberia devolver 401 si no se proporciona token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
  });

  it('deberia devolver 401 si el token es invalido o manipulado', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer token_invalido_12345');

    expect(res.status).toBe(401);
  });
});
