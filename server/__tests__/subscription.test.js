/**
 * Tests de Kronos Pro / Suscripciones.
 *
 * Cubre:
 *   - requireTier (middleware unitario)
 *   - postLimiter (middleware contra mongodb-memory-server)
 *   - subscriptionService.syncFeatures + getSubscription
 *   - rutas /api/subscription/{checkout, status, cancel} con Stripe mockeado
 *
 * Stripe se mockea completo: ningún test toca la red.
 */

// ── Mock de Stripe ANTES de cargar nada que lo use ────────────────────────
const mockStripe = {
  customers: {
    create: jest.fn(async ({ email, metadata }) => ({
      id: `cus_test_${metadata?.userId || 'x'}`,
      email
    }))
  },
  checkout: {
    sessions: {
      create: jest.fn(async (params) => ({
        id: 'cs_test_123',
        url: 'https://stripe.test/checkout/cs_test_123',
        ...params
      }))
    }
  },
  subscriptions: {
    retrieve: jest.fn(async (id) => ({
      id,
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
      items: { data: [{ price: { id: 'price_pro_test' } }] }
    })),
    update: jest.fn(async (id, params) => ({
      id,
      status: 'active',
      cancel_at_period_end: !!params.cancel_at_period_end
    }))
  },
  webhooks: {
    constructEvent: jest.fn()
  }
};

jest.mock('../config/stripe', () => ({
  stripe: mockStripe,
  createClothingCheckoutSession: jest.fn(),
  createFoodCheckoutSession: jest.fn(),
  getCheckoutSession: jest.fn(),
  handleStripeWebhook: jest.fn(),
  refundPayment: jest.fn()
}));

// ── Setup ─────────────────────────────────────────────────────────────────
const request = require('supertest');
const express = require('express');
const { protect } = require('../middleware/auth');
const { requireTier, requireFeature } = require('../middleware/requireTier');
const { postLimiter } = require('../middleware/postLimiter');
const { register } = require('../controllers/authController');
const postController = require('../controllers/postController');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const subscriptionService = require('../services/subscriptionService');
const subscriptionRoutes = require('../routes/subscription');

let app;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_jwt_secret_kronos';
  process.env.STRIPE_PRO_PRICE_ID = 'price_pro_test';
  process.env.STRIPE_BUSINESS_PRICE_ID = 'price_business_test';

  app = express();
  app.use(express.json());

  app.post('/api/auth/register', register);

  // Posts con limiter
  app.post('/api/posts', protect, postLimiter, postController.createPost);

  // Subscription routes
  app.use('/api/subscription', subscriptionRoutes);

  // Endpoints sintéticos para probar middlewares
  app.get('/api/_test/pro-only', protect, requireTier('pro'), (req, res) =>
    res.json({ ok: true })
  );
  app.get('/api/_test/biz-only', protect, requireTier('business'), (req, res) =>
    res.json({ ok: true })
  );
  app.get('/api/_test/ai-only', protect, requireFeature('aiGenerator'), (req, res) =>
    res.json({ ok: true })
  );
});

beforeEach(() => {
  Object.values(mockStripe).forEach((group) => {
    if (typeof group === 'object') {
      Object.values(group).forEach((fn) => {
        if (typeof fn?.mockClear === 'function') fn.mockClear();
      });
    }
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────

const registerUser = async (suffix = '') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: `subuser${suffix}`,
      email: `subuser${suffix}@kronos.com`,
      password: 'Password123',
      firstName: 'Sub',
      lastName: 'User'
    });
  return { token: res.body.token, userId: res.body.user.id };
};

// ── requireTier ───────────────────────────────────────────────────────────

describe('requireTier middleware', () => {
  it('bloquea a usuarios free con 403 cuando se exige pro', async () => {
    const { token } = await registerUser('rt1');
    const res = await request(app)
      .get('/api/_test/pro-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.upgrade_url).toBe('/pricing');
    expect(res.body.requiredTier).toBe('pro');
  });

  it('deja pasar a usuarios pro cuando se exige pro', async () => {
    const { token, userId } = await registerUser('rt2');
    await User.findByIdAndUpdate(userId, { tier: 'pro' });

    const res = await request(app)
      .get('/api/_test/pro-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('un usuario pro NO accede a endpoints business-only', async () => {
    const { token, userId } = await registerUser('rt3');
    await User.findByIdAndUpdate(userId, { tier: 'pro' });

    const res = await request(app)
      .get('/api/_test/biz-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.requiredTier).toBe('business');
  });

  it('business sí accede a endpoints business-only', async () => {
    const { token, userId } = await registerUser('rt4');
    await User.findByIdAndUpdate(userId, { tier: 'business' });

    const res = await request(app)
      .get('/api/_test/biz-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

// ── requireFeature ────────────────────────────────────────────────────────

describe('requireFeature middleware', () => {
  it('bloquea cuando el flag no está activado', async () => {
    const { token } = await registerUser('rf1');
    const res = await request(app)
      .get('/api/_test/ai-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.feature).toBe('aiGenerator');
  });

  it('deja pasar cuando el feature está habilitado', async () => {
    const { token, userId } = await registerUser('rf2');
    await User.findByIdAndUpdate(userId, {
      'features.aiGenerator': true
    });

    const res = await request(app)
      .get('/api/_test/ai-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

// ── postLimiter ───────────────────────────────────────────────────────────

describe('postLimiter middleware', () => {
  const post = (token, content) =>
    request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content });

  // Espera a que el incremento async del contador se aplique en BD
  const waitForCount = async (userId, expected, attempts = 20) => {
    for (let i = 0; i < attempts; i++) {
      const u = await User.findById(userId).select('dailyPostCount').lean();
      if (u?.dailyPostCount === expected) return;
      await new Promise((r) => setTimeout(r, 25));
    }
  };

  it('permite hasta 5 posts/día a un usuario free y bloquea el 6º', async () => {
    const { token, userId } = await registerUser('pl1');

    for (let i = 1; i <= 5; i++) {
      const res = await post(token, `Post ${i}`);
      expect(res.status).toBe(201);
      await waitForCount(userId, i);
    }

    const blocked = await post(token, 'Post 6 (debería bloquearse)');
    expect(blocked.status).toBe(429);
    expect(blocked.body.upgrade).toBe(true);
    expect(blocked.body.limit).toBe(5);
  });

  it('un usuario pro no tiene límite diario', async () => {
    const { token, userId } = await registerUser('pl2');
    await User.findByIdAndUpdate(userId, {
      tier: 'pro',
      'features.unlimitedPosts': true
    });

    for (let i = 1; i <= 7; i++) {
      const res = await post(token, `Pro post ${i}`);
      expect(res.status).toBe(201);
    }
  });

  it('resetea el contador cuando lastPostReset es de un día anterior', async () => {
    const { token, userId } = await registerUser('pl3');

    // Saturar el contador "ayer"
    const yesterday = new Date(Date.now() - 36 * 3600 * 1000);
    await User.findByIdAndUpdate(userId, {
      dailyPostCount: 5,
      lastPostReset: yesterday
    });

    const res = await post(token, 'Primer post de hoy');
    expect(res.status).toBe(201);
    await waitForCount(userId, 1);
  });
});

// ── subscriptionService ───────────────────────────────────────────────────

describe('subscriptionService', () => {
  it('syncFeatures aplica el set de features según el tier', async () => {
    const { userId } = await registerUser('svc1');

    await subscriptionService.syncFeatures(userId, 'pro');
    let u = await User.findById(userId).lean();
    expect(u.tier).toBe('pro');
    expect(u.features.aiGenerator).toBe(true);
    expect(u.features.advancedAnalytics).toBe(false);

    await subscriptionService.syncFeatures(userId, 'business');
    u = await User.findById(userId).lean();
    expect(u.tier).toBe('business');
    expect(u.features.advancedAnalytics).toBe(true);
    expect(u.features.apiAccess).toBe(true);

    await subscriptionService.syncFeatures(userId, 'free');
    u = await User.findById(userId).lean();
    expect(u.tier).toBe('free');
    expect(u.features.aiGenerator).toBe(false);
  });

  it('getSubscription devuelve tier y features del usuario', async () => {
    const { userId } = await registerUser('svc2');
    await subscriptionService.syncFeatures(userId, 'pro');

    const data = await subscriptionService.getSubscription(userId);
    expect(data.tier).toBe('pro');
    expect(data.features.aiGenerator).toBe(true);
    expect(data.subscription).toBeNull();
  });

  it('handleSubscriptionWebhook procesa checkout.session.completed', async () => {
    const { userId } = await registerUser('svc3');

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_x',
          mode: 'subscription',
          customer: 'cus_test_svc3',
          subscription: 'sub_test_svc3',
          metadata: { userId: userId.toString(), tier: 'pro' }
        }
      }
    };

    await subscriptionService.handleSubscriptionWebhook(event);

    const u = await User.findById(userId).lean();
    expect(u.tier).toBe('pro');
    expect(u.features.aiGenerator).toBe(true);

    const sub = await Subscription.findOne({ userId }).lean();
    expect(sub).toBeTruthy();
    expect(sub.tier).toBe('pro');
    expect(sub.stripeSubscriptionId).toBe('sub_test_svc3');
    expect(sub.status).toBe('active');
  });

  it('handleSubscriptionWebhook degrada a free al borrar la suscripción', async () => {
    const { userId } = await registerUser('svc4');
    await subscriptionService.syncFeatures(userId, 'pro');
    await Subscription.create({
      userId,
      tier: 'pro',
      stripeSubscriptionId: 'sub_to_delete',
      status: 'active'
    });

    await subscriptionService.handleSubscriptionWebhook({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_to_delete' } }
    });

    const u = await User.findById(userId).lean();
    expect(u.tier).toBe('free');
    expect(u.features.aiGenerator).toBe(false);

    const sub = await Subscription.findOne({ stripeSubscriptionId: 'sub_to_delete' }).lean();
    expect(sub.status).toBe('canceled');
    expect(sub.canceledAt).toBeTruthy();
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────

describe('POST /api/subscription/checkout', () => {
  it('crea sesión de Stripe Checkout y devuelve URL', async () => {
    const { token } = await registerUser('co1');

    const res = await request(app)
      .post('/api/subscription/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ tier: 'pro' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toContain('stripe.test/checkout');
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledTimes(1);
  });

  it('rechaza tier inválido', async () => {
    const { token } = await registerUser('co2');

    const res = await request(app)
      .post('/api/subscription/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ tier: 'enterprise' });

    expect(res.status).toBe(400);
  });

  it('rechaza sin token', async () => {
    const res = await request(app)
      .post('/api/subscription/checkout')
      .send({ tier: 'pro' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/subscription/status', () => {
  it('devuelve tier free por defecto', async () => {
    const { token } = await registerUser('st1');

    const res = await request(app)
      .get('/api/subscription/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('free');
    expect(res.body.features).toBeDefined();
  });

  it('refleja el tier pro tras syncFeatures', async () => {
    const { token, userId } = await registerUser('st2');
    await subscriptionService.syncFeatures(userId, 'pro');

    const res = await request(app)
      .get('/api/subscription/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('pro');
    expect(res.body.features.aiGenerator).toBe(true);
  });
});

describe('POST /api/subscription/cancel', () => {
  it('marca la suscripción para cancelar al final del periodo', async () => {
    const { token, userId } = await registerUser('cn1');
    await Subscription.create({
      userId,
      tier: 'pro',
      stripeSubscriptionId: 'sub_to_cancel',
      status: 'active'
    });

    const res = await request(app)
      .post('/api/subscription/cancel')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.subscription.cancelAtPeriodEnd).toBe(true);
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
      'sub_to_cancel',
      { cancel_at_period_end: true }
    );
  });

  it('falla si no hay suscripción activa', async () => {
    const { token } = await registerUser('cn2');

    const res = await request(app)
      .post('/api/subscription/cancel')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
