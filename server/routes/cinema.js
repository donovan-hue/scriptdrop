const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const { createRoom, getRooms, getRoom, joinRoom, syncState, sendChatMessage } = require('../controllers/cinemaController');

router.post('/', auth, createRoom);
router.get('/', auth, getRooms);
router.get('/:id', auth, getRoom);
router.post('/:id/join', auth, joinRoom);
router.patch('/:id/sync', auth, syncState);
router.post('/:id/chat', auth, sendChatMessage);

module.exports = router;
