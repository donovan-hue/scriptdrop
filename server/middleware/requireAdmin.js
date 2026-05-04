// Requiere que req.user ya esté seteado por authMiddleware
module.exports = function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Requiere permisos de admin' });
  }
  next();
};
