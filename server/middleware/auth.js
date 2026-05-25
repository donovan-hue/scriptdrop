const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No tienes permiso para acceder a esta ruta' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Garantizar ambas formas: req.user._id (ObjectId) y req.user.id (string)
    if (!req.user.id) req.user.id = req.user._id.toString();

    next();
  } catch (error) {
    return res.status(401).json({ message: 'No tienes permiso para acceder a esta ruta' });
  }
};

const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso' });
    }
    next();
  };
};

module.exports = { protect, checkRole };
