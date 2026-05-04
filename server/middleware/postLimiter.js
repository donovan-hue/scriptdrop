const User = require('../models/User');

const FREE_DAILY_POST_LIMIT = 5;

/**
 * Compara dos fechas e indica si pertenecen al mismo día UTC.
 */
const isSameUtcDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
};

/**
 * Limita a 5 posts/día para usuarios free.
 * Pro y Business no tienen límite (features.unlimitedPosts === true).
 *
 * Cuenta sólo cuando el handler aguas abajo realmente crea el post:
 * incrementamos el contador después de que el post se haya guardado,
 * vía un hook en res.json. Si el handler responde con error (status >= 400),
 * no se cuenta.
 */
const postLimiter = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Pro / Business: ilimitado
    if (req.user.features?.unlimitedPosts) {
      return next();
    }

    const now = new Date();
    let count = req.user.dailyPostCount || 0;

    // Resetear contador si el último post fue otro día
    if (!isSameUtcDay(req.user.lastPostReset, now)) {
      count = 0;
    }

    if (count >= FREE_DAILY_POST_LIMIT) {
      return res.status(429).json({
        error: 'Llegaste al límite diario de posts',
        limit: FREE_DAILY_POST_LIMIT,
        currentTier: req.user.tier || 'free',
        upgrade: true,
        upgrade_url: '/pricing'
      });
    }

    // Hook: incrementar contador sólo si la respuesta fue 2xx
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const update = isSameUtcDay(req.user.lastPostReset, now)
          ? { $inc: { dailyPostCount: 1 } }
          : { dailyPostCount: 1, lastPostReset: now };

        // Fire-and-forget: no bloqueamos la respuesta
        User.findByIdAndUpdate(req.user._id, update).catch((err) => {
          console.error('postLimiter increment failed:', err);
        });
      }
      return originalJson(body);
    };

    return next();
  } catch (err) {
    console.error('postLimiter error:', err);
    return next(err);
  }
};

module.exports = { postLimiter, FREE_DAILY_POST_LIMIT };
