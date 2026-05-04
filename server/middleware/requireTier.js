/**
 * Middleware factory que exige un tier mínimo (pro, business).
 * Si el usuario no cumple, responde 403 con upgrade_url.
 *
 * Uso:
 *   router.post('/feature-pro', protect, requireTier('pro'), handler);
 *   router.get('/api-stats',  protect, requireTier('business'), handler);
 */

const TIER_RANK = { free: 0, pro: 1, business: 2 };

const requireTier = (minTier) => {
  if (!(minTier in TIER_RANK)) {
    throw new Error(`Tier inválido en requireTier: ${minTier}`);
  }

  return (req, res, next) => {
    const userTier = req.user?.tier || 'free';
    const userRank = TIER_RANK[userTier] ?? 0;
    const requiredRank = TIER_RANK[minTier];

    if (userRank < requiredRank) {
      return res.status(403).json({
        error: `Esta función requiere Kronos ${minTier === 'pro' ? 'Pro' : 'Business'}`,
        currentTier: userTier,
        requiredTier: minTier,
        upgrade_url: '/pricing'
      });
    }

    return next();
  };
};

/**
 * Variante que verifica un feature flag específico, en lugar del tier.
 * Útil cuando el feature está disponible en planes que no son contiguos.
 *
 *   router.post('/ai/generate', protect, requireFeature('aiGenerator'), handler);
 */
const requireFeature = (featureKey) => {
  return (req, res, next) => {
    const features = req.user?.features || {};
    if (!features[featureKey]) {
      return res.status(403).json({
        error: `Esta función no está disponible en tu plan (${req.user?.tier || 'free'})`,
        feature: featureKey,
        upgrade_url: '/pricing'
      });
    }
    return next();
  };
};

module.exports = { requireTier, requireFeature, TIER_RANK };
