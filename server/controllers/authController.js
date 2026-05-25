const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { createNotification } = require('./notificationController');

// Registrar usuario
exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, firstName, lastName } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Se requiere email o número de teléfono' });
    }

    // Verificar si ya existe por email, teléfono o username
    const orConditions = [{ username }];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    let user = await User.findOne({ $or: orConditions });
    if (user) {
      if (user.username === username) return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      if (email && user.email === email) return res.status(400).json({ message: 'El email ya está registrado' });
      if (phone && user.phone === phone) return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
    }

    // Si no tiene email, generar uno interno para que el modelo lo acepte
    const internalEmail = email || `${username}@kronos.phone`;

    user = new User({
      username,
      email: internalEmail,
      phone: phone || undefined,
      password,
      firstName,
      lastName
    });

    await user.save();

    if (email) {
      emailService.sendWelcome(user.email, user.firstName || user.username)
        .catch(err => console.error('Welcome email failed:', err));
    }

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
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: 'Proporciona email o teléfono y contraseña' });
    }

    // Buscar por email o teléfono
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Validar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
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
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Ya sigues a este usuario' });
    }

    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userId);

    await userToFollow.save();
    await currentUser.save();

    createNotification({
      recipient: userId,
      sender: currentUserId,
      type: 'follow',
      title: `${currentUser.firstName || currentUser.username} empezó a seguirte`,
      body: 'Ahora te sigue',
      link: `/profile/${currentUserId}`,
    }).catch(() => {});

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
      return res.status(400).json({ message: 'Por favor proporciona un email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no
      return res.status(200).json({ message: 'Si ese email existe, recibirás el enlace en unos minutos' });
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

    res.status(200).json({ message: 'Si ese email existe, recibirás el enlace en unos minutos' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password — verifica token y guarda nueva contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'El enlace expiró o es inválido. Solicita uno nuevo.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
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
      return res.status(404).json({ message: 'Usuario no encontrado' });
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
