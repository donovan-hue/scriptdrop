const ActiveSession = require('../models/ActiveSession');

// GET /api/sessions - Listar sesiones activas del usuario autenticado
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await ActiveSession.find({ userId, isActive: true })
      .select('-token')
      .sort({ lastActivityAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sessions/:id - Cerrar una sesion especifica
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await ActiveSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isActive = false;
    session.logoutAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session closed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sessions/all - Cerrar todas las sesiones excepto la actual
exports.deleteAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Extraer el token actual del header Authorization
    const currentToken = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;

    const filter = { userId, isActive: true };

    // Excluir la sesion actual si se tiene el token
    if (currentToken) {
      filter.token = { $ne: currentToken };
    }

    const result = await ActiveSession.updateMany(filter, {
      $set: { isActive: false, logoutAt: new Date() }
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} session(s) closed successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
