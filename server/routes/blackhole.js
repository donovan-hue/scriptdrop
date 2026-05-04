const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const {
  createEvent, getEvents, getEvent, joinEvent, leaveEvent, updateStatus
} = require('../controllers/blackHoleController');

router.post('/', auth, createEvent);
router.get('/', auth, getEvents);
router.get('/:id', auth, getEvent);
router.post('/:id/join', auth, joinEvent);
router.post('/:id/leave', auth, leaveEvent);
router.patch('/:id/status', auth, updateStatus);

module.exports = router;
