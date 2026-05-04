/**
 * Tests de posts - POST /api/posts, GET /api/posts/feed,
 *                  POST /api/posts/:postId/like, DELETE /api/posts/:postId
 *
 * Usa mongodb-memory-server (via setup.js) y supertest.
 * Construye una mini-app de Express para evitar dependencias opcionales
 * (passport-google, passport-facebook, socket.io, etc.)
 */

const request = require('supertest');
const express = require('express');
const { protect } = require('../middleware/auth');
const { register } = require('../controllers/authController');
const postController = require('../controllers/postController');

let app;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret_kronos';

  app = express();
  app.use(express.json());

  // Auth endpoint (necesario para crear usuarios en tests)
  app.post('/api/auth/register', register);

  // Posts endpoints
  app.post('/api/posts', protect, postController.createPost);
  app.get('/api/posts/feed', protect, postController.getFeed);
  app.get('/api/posts/user/:userId', postController.getUserPosts);
  app.post('/api/posts/:postId/like', protect, postController.likePost);
  app.delete('/api/posts/:postId', protect, postController.deletePost);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const registerUser = async (suffix = '') => {
  const userData = {
    username: `user${suffix}`,
    email: `user${suffix}@kronos.com`,
    password: 'Password123',
    firstName: 'Test',
    lastName: 'User'
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(userData);

  return { token: res.body.token, userId: res.body.user.id };
};

const postRequest = (token, content = 'Mi primer post de prueba') => {
  return request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ content });
};

// ─── POST /api/posts ──────────────────────────────────────────────────────────

describe('POST /api/posts', () => {
  it('deberia crear un post y devolver 201 si el usuario esta autenticado', async () => {
    const { token } = await registerUser('p1');

    const res = await postRequest(token, 'Hola Kronos!');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post).toBeDefined();
    expect(res.body.post.content).toBe('Hola Kronos!');
    expect(res.body.post.author).toBeDefined();
  });

  it('deberia devolver 401 si se intenta crear un post sin autenticacion', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ content: 'Post sin token' });

    expect(res.status).toBe(401);
  });

  it('deberia crear un post con visibilidad publica por defecto', async () => {
    const { token } = await registerUser('p2');

    const res = await postRequest(token, 'Post publico');

    expect(res.status).toBe(201);
    expect(res.body.post.visibility).toBe('public');
  });
});

// ─── GET /api/posts/feed ──────────────────────────────────────────────────────

describe('GET /api/posts/feed', () => {
  it('deberia devolver 200 con el feed del usuario autenticado', async () => {
    const { token } = await registerUser('feed1');

    // Crear algunos posts propios
    await postRequest(token, 'Post para el feed 1');
    await postRequest(token, 'Post para el feed 2');

    const res = await request(app)
      .get('/api/posts/feed')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.posts)).toBe(true);
    // El usuario ve sus propios posts en el feed
    expect(res.body.posts.length).toBeGreaterThanOrEqual(2);
  });

  it('deberia devolver 401 si no hay token al pedir el feed', async () => {
    const res = await request(app).get('/api/posts/feed');

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/posts/:postId/like ─────────────────────────────────────────────

describe('POST /api/posts/:postId/like', () => {
  it('deberia dar like a un post y devolver 200', async () => {
    const { token: authorToken } = await registerUser('like1');
    const { token: likerToken } = await registerUser('like2');

    const postRes = await postRequest(authorToken, 'Post para likear');
    const postId = postRes.body.post._id;

    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${likerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/liked/i);
  });

  it('deberia devolver 400 si el usuario intenta dar like dos veces al mismo post', async () => {
    const { token } = await registerUser('like3');

    const postRes = await postRequest(token, 'Post para doble like');
    const postId = postRes.body.post._id;

    // Primer like
    await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    // Segundo like (duplicado - debe fallar)
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already liked/i);
  });

  it('deberia devolver 404 si el post no existe', async () => {
    const { token } = await registerUser('like4');
    const fakeId = '64a0f0f0f0f0f0f0f0f0f0f0';

    const res = await request(app)
      .post(`/api/posts/${fakeId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/posts/:postId ────────────────────────────────────────────────

describe('DELETE /api/posts/:postId', () => {
  it('el autor deberia poder borrar su propio post y obtener 200', async () => {
    const { token } = await registerUser('del1');

    const postRes = await postRequest(token, 'Post a borrar');
    const postId = postRes.body.post._id;

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('otro usuario NO deberia poder borrar el post ajeno - devuelve 403', async () => {
    const { token: authorToken } = await registerUser('del2');
    const { token: otherToken } = await registerUser('del3');

    const postRes = await postRequest(authorToken, 'Post de otro usuario');
    const postId = postRes.body.post._id;

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('deberia devolver 401 al intentar borrar sin token', async () => {
    const { token } = await registerUser('del4');

    const postRes = await postRequest(token, 'Post sin token delete');
    const postId = postRes.body.post._id;

    const res = await request(app)
      .delete(`/api/posts/${postId}`);

    expect(res.status).toBe(401);
  });
});
