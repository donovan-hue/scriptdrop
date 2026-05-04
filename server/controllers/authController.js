const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Registrar usuario
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Verificar si el usuario ya existe
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Crear nuevo usuario
    user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    emailService.sendWelcome(user.email, user.firstName || user.username)
      .catch(err => console.error('Welcome email failed:', err));

    // Crear JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Buscar usuario
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Crear JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener perfil
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers')
      .populate('following');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seguir usuario
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userId);

    await userToFollow.save();
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Started following user'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password - genera token y envía email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no
      return res.status(200).json({ message: 'If that email exists, a reset link was sent' });
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Guardar en el usuario (con expiración de 1 hora)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save({ validateBeforeSave: false });

    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;

    emailService.sendPasswordReset(user.email, user.firstName || user.username, resetLink)
      .catch(err => console.error('Password reset email failed:', err));

    res.status(200).json({ message: 'If that email exists, a reset link was sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dejar de seguir
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (following) => following.toString() !== userId
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Unfollowed user'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
