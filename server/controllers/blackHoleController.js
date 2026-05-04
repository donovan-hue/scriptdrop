const BlackHoleEvent = require('../models/BlackHoleEvent');
const UserWallet = require('../models/UserWallet');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, maxParticipants, prizePool, entryFee, eventType, rules, tags } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'title, startTime y endTime son requeridos' });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: 'endTime debe ser posterior a startTime' });
    }

    // If creator contributes to prize pool, debit their wallet
    if (prizePool > 0) {
      const wallet = await UserWallet.findOne({ userId: req.user.id });
      if (!wallet || wallet.balance < prizePool) {
        return res.status(400).json({ message: 'Balance KRO insuficiente para el premio' });
      }
      await UserWallet.findOneAndUpdate({ userId: req.user.id }, { $inc: { balance: -prizePool } });
    }

    const event = await BlackHoleEvent.create({
      title, description, creator: req.user.id,
      startTime, endTime, maxParticipants: maxParticipants || 1000,
      prizePool: prizePool || 0, entryFee: entryFee || 0,
      eventType: eventType || 'challenge', rules, tags: tags || []
    });

    await event.populate('creator', 'username avatar');
    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating black hole event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { status, page = 0, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    else query.status = { $in: ['upcoming', 'live'] };

    const events = await BlackHoleEvent.find(query)
      .populate('creator', 'username avatar')
      .sort({ startTime: 1 })
      .skip(Number(page) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Add participant count and user joined status
    const userId = req.user?.id;
    const enriched = events.map(e => ({
      ...e,
      participantCount: e.participants.length,
      isFull: e.participants.length >= e.maxParticipants,
      userJoined: userId ? e.participants.some(p => p.toString() === userId) : false
    }));

    res.json({ events: enriched });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await BlackHoleEvent.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('winner', 'username avatar')
      .lean();

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user?.id;
    res.json({
      event: {
        ...event,
        participantCount: event.participants.length,
        userJoined: userId ? event.participants.some(p => p.toString() === userId) : false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event' });
  }
};

exports.joinEvent = async (req, res) => {
  try {
    const event = await BlackHoleEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status === 'ended') return res.status(400).json({ message: 'Este evento ya termino' });
    if (event.participants.includes(req.user.id)) return res.status(400).json({ message: 'Ya estas en este evento' });
    if (event.participants.length >= event.maxParticipants) return res.status(400).json({ message: 'Evento lleno' });

    // Charge entry fee if required
    if (event.entryFee > 0) {
      const wallet = await UserWallet.findOne({ userId: req.user.id });
      if (!wallet || wallet.balance < event.entryFee) {
        return res.status(400).json({ message: `Necesitas ${event.entryFee} KRO para entrar` });
      }
      await UserWallet.findOneAndUpdate({ userId: req.user.id }, { $inc: { balance: -event.entryFee } });
      await BlackHoleEvent.findByIdAndUpdate(req.params.id, { $inc: { prizePool: event.entryFee } });
    }

    event.participants.push(req.user.id);
    // Increase gravitational pull
    event.gravitationalPull += 1;
    await event.save();

    res.json({ message: 'Te uniste al evento exitosamente', participantCount: event.participants.length });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ message: 'Error joining event' });
  }
};

exports.leaveEvent = async (req, res) => {
  try {
    const event = await BlackHoleEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.participants.includes(req.user.id)) return res.status(400).json({ message: 'No estas en este evento' });
    if (event.status === 'live') return res.status(400).json({ message: 'No puedes salir de un evento en vivo' });

    await BlackHoleEvent.findByIdAndUpdate(req.params.id, {
      $pull: { participants: req.user.id },
      $inc: { gravitationalPull: -1 }
    });

    // Refund entry fee if event hasn't started
    if (event.entryFee > 0 && event.status === 'upcoming') {
      await UserWallet.findOneAndUpdate({ userId: req.user.id }, { $inc: { balance: event.entryFee } });
      await BlackHoleEvent.findByIdAndUpdate(req.params.id, { $inc: { prizePool: -event.entryFee } });
    }

    res.json({ message: 'Saliste del evento' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving event' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await BlackHoleEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user.id) return res.status(403).json({ message: 'Solo el creador puede actualizar el estado' });

    event.status = status;

    // Auto-select winner when ending
    if (status === 'ended' && event.participants.length > 0 && !event.winner) {
      const winnerIndex = Math.floor(Math.random() * event.participants.length);
      event.winner = event.participants[winnerIndex];
      // Award prize pool to winner
      if (event.prizePool > 0) {
        await UserWallet.findOneAndUpdate({ userId: event.winner }, { $inc: { balance: event.prizePool } }, { upsert: true });
      }
    }

    await event.save();
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
};
