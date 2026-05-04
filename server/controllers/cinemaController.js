const CinemaRoom = require('../models/CinemaRoom');
const bcrypt = require('bcryptjs');

exports.createRoom = async (req, res) => {
  try {
    const { name, videoUrl, videoTitle, videoDuration, isPrivate, password, maxParticipants } = req.body;
    if (!name || !videoUrl) return res.status(400).json({ message: 'name y videoUrl son requeridos' });

    let hashedPassword;
    if (isPrivate && password) hashedPassword = await bcrypt.hash(password, 10);

    const room = await CinemaRoom.create({
      name, videoUrl, videoTitle, videoDuration: videoDuration || 0,
      host: req.user.id,
      participants: [req.user.id],
      isPrivate: isPrivate || false,
      password: hashedPassword,
      maxParticipants: maxParticipants || 50
    });

    await room.populate('host', 'username avatar');
    res.status(201).json({ room: { ...room.toObject(), password: undefined } });
  } catch (error) {
    console.error('Error creating cinema room:', error);
    res.status(500).json({ message: 'Error creating cinema room' });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await CinemaRoom.find({ isPrivate: false, status: { $ne: 'ended' } })
      .populate('host', 'username avatar')
      .select('-password -chat -reactions')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const enriched = rooms.map(r => ({
      ...r,
      participantCount: r.participants.length,
      isFull: r.participants.length >= r.maxParticipants
    }));

    res.json({ rooms: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await CinemaRoom.findById(req.params.id)
      .populate('host', 'username avatar')
      .populate('participants', 'username avatar')
      .select('-password')
      .lean();

    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { password } = req.body;
    const room = await CinemaRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.status === 'ended') return res.status(400).json({ message: 'Esta sala ya termino' });
    if (room.participants.length >= room.maxParticipants) return res.status(400).json({ message: 'Sala llena' });

    if (room.isPrivate && room.password) {
      if (!password) return res.status(401).json({ message: 'Esta sala requiere contraseña' });
      const valid = await bcrypt.compare(password, room.password);
      if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }

    res.json({
      room: { ...room.toObject(), password: undefined },
      currentTime: room.currentTime,
      isPlaying: room.isPlaying
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining room' });
  }
};

exports.syncState = async (req, res) => {
  try {
    const { currentTime, isPlaying } = req.body;
    const room = await CinemaRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.host.toString() !== req.user.id) return res.status(403).json({ message: 'Solo el host puede sincronizar' });

    room.currentTime = currentTime;
    room.isPlaying = isPlaying;
    room.status = isPlaying ? 'playing' : 'paused';
    await room.save();

    res.json({ currentTime, isPlaying });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing state' });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'message is required' });

    const room = await CinemaRoom.findByIdAndUpdate(
      req.params.id,
      { $push: { chat: { user: req.user.id, username: req.user.username, message: message.trim() } } },
      { new: true }
    );

    if (!room) return res.status(404).json({ message: 'Room not found' });

    const lastMsg = room.chat[room.chat.length - 1];
    res.json({ message: lastMsg });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};
