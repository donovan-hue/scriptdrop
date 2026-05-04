const express = require('express');
const { protect: auth } = require('../middleware/auth');
const secureChatController = require('../controllers/secureChatController');

const router = express.Router();

// Conversations
router.get('/', auth, secureChatController.getConversations);
router.get('/:participantId/or-create', auth, secureChatController.getOrCreateConversation);
router.patch('/:conversationId/paranoia', auth, secureChatController.updateParanoiaSettings);

// Messages
router.post('/:conversationId/messages', auth, secureChatController.sendMessage);
router.get('/:conversationId/messages', auth, secureChatController.getMessages);
router.delete('/:messageId', auth, secureChatController.deleteMessage);

// Reactions
router.post('/:messageId/react', auth, secureChatController.reactToMessage);

module.exports = router;
