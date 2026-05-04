const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  followUser,
  unfollowUser,
  forgotPassword
} = require('../controllers/authController');
const passport = require('../config/passport');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ─── Rutas existentes ─────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/profile', protect, getProfile);
router.post('/follow/:userId', protect, followUser);
router.post('/unfollow/:userId', protect, unfollowUser);

// ─── Google OAuth ─────────────────────────────────────────────────────────
// Redirige al usuario a la pantalla de consentimiento de Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google llama a este callback después del consentimiento
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=google_failed` }),
  (req, res) => {
    const { token, user } = req.user;
    // Redirige al frontend con el token como query param
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&provider=google`);
  }
);

// ─── Facebook OAuth ───────────────────────────────────────────────────────
// Redirige al usuario a Facebook
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

// Facebook llama a este callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/login?error=facebook_failed` }),
  (req, res) => {
    const { token, user } = req.user;
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&provider=facebook`);
  }
);

module.exports = router;
