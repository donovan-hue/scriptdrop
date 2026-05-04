// ─── Cache Service ────────────────────────────────────────────────────────────
// Uses Redis when REDIS_URL is configured, otherwise falls back to an in-process
// Map-based cache (data is lost on server restart but the app does NOT crash).

// Cache keys
const CACHE_KEYS = {
  user: (id) => `user:${id}`,
  feed: (id, page) => `feed:${id}:${page}`,
  products: (page) => `products:${page}`,
  post: (id) => `post:${id}`,
  comments: (postId) => `comments:${postId}`,
  session: (token) => `session:${token}`
};

// ─── In-memory fallback ───────────────────────────────────────────────────────
class MemoryCache {
  constructor() {
    this._store = new Map(); // key → { value, expiresAt }
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  async setEx(key, ttlSeconds, serialized) {
    this._store.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async del(key) {
    if (Array.isArray(key)) {
      key.forEach(k => this._store.delete(k));
    } else {
      this._store.delete(key);
    }
  }

  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return [...this._store.keys()].filter(k => regex.test(k));
  }

  // Single-pass delete for pattern matching — avoids building an intermediate keys array
  async deletePattern(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this._store.keys()) {
      if (regex.test(key)) this._store.delete(key);
    }
  }

  // Evict expired entries proactively so the Map stays bounded
  evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now > entry.expiresAt) this._store.delete(key);
    }
  }
}

// ─── Redis or fallback ────────────────────────────────────────────────────────
let client;
let usingMemoryFallback = false;

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('⚠️  REDIS_URL no configurada - usando cache en memoria (no persistente)');
  client = new MemoryCache();
  usingMemoryFallback = true;
  // Evict expired entries every 5 minutes to keep memory bounded
  setInterval(() => client.evictExpired(), 5 * 60 * 1000).unref();
} else {
  try {
    const redis = require('redis');
    client = redis.createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis error:', err));
    client.connect().catch((err) => {
      console.warn('⚠️  No se pudo conectar a Redis, usando cache en memoria:', err.message);
      client = new MemoryCache();
      usingMemoryFallback = true;
    });
  } catch (err) {
    console.warn('⚠️  Modulo redis no disponible, usando cache en memoria:', err.message);
    client = new MemoryCache();
    usingMemoryFallback = true;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Get from cache
exports.get = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

// Set cache with TTL
exports.set = async (key, value, ttl = 3600) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

// Delete cache
exports.delete = async (key) => {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

// Clear pattern
exports.clearPattern = async (pattern) => {
  try {
    // MemoryCache has a single-pass deletePattern — use it when available
    if (client.deletePattern) {
      await client.deletePattern(pattern);
    } else {
      const keys = await client.keys(pattern);
      if (keys.length > 0) await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

// Cache user data
exports.cacheUser = async (userId, userData, ttl = 7200) => {
  return exports.set(CACHE_KEYS.user(userId), userData, ttl);
};

exports.getUser = async (userId) => {
  return exports.get(CACHE_KEYS.user(userId));
};

exports.invalidateUser = async (userId) => {
  return exports.delete(CACHE_KEYS.user(userId));
};

// Cache feed
exports.cacheFeed = async (userId, page, feedData, ttl = 1800) => {
  return exports.set(CACHE_KEYS.feed(userId, page), feedData, ttl);
};

exports.getFeed = async (userId, page) => {
  return exports.get(CACHE_KEYS.feed(userId, page));
};

exports.invalidateFeed = async (userId) => {
  return exports.clearPattern(`feed:${userId}:*`);
};

// Cache products
exports.cacheProducts = async (page, productsData, ttl = 3600) => {
  return exports.set(CACHE_KEYS.products(page), productsData, ttl);
};

exports.getProducts = async (page) => {
  return exports.get(CACHE_KEYS.products(page));
};

exports.invalidateProducts = async () => {
  return exports.clearPattern('products:*');
};

// Cache post
exports.cachePost = async (postId, postData, ttl = 1800) => {
  return exports.set(CACHE_KEYS.post(postId), postData, ttl);
};

exports.getPost = async (postId) => {
  return exports.get(CACHE_KEYS.post(postId));
};

exports.invalidatePost = async (postId) => {
  return exports.delete(CACHE_KEYS.post(postId));
};

// Cache comments
exports.cacheComments = async (postId, commentsData, ttl = 1800) => {
  return exports.set(CACHE_KEYS.comments(postId), commentsData, ttl);
};

exports.getComments = async (postId) => {
  return exports.get(CACHE_KEYS.comments(postId));
};

exports.invalidateComments = async (postId) => {
  return exports.delete(CACHE_KEYS.comments(postId));
};

exports.CACHE_KEYS = CACHE_KEYS;
exports.client = client;
exports.usingMemoryFallback = usingMemoryFallback;
