const SecureMessage = require('../models/SecureMessage');
const SecureConversation = require('../models/SecureConversation');
const crypto = require('crypto');

// Encryption utils
const encrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text, key) => {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Get or create secure conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user.id;

    let conversation = await SecureConversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { userId } },
          { $elemMatch: { userId: participantId } }
        ]
      }
    });

    if (!conversation) {
      conversation = new SecureConversation({
        participants: [
          { userId, joinedAt: new Date() },
          { userId: participantId, joinedAt: new Date() }
        ],
        isParanoia: true
      });
      await conversation.save();
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Send encrypted message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { encryptedContent, iv, ephemeralPublicKey } = req.body;

    const conversation = await SecureConversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });

    const messageHash = crypto.createHash('sha256').update(encryptedContent).digest('hex');

    const message = new SecureMessage({
      senderId: req.user.id,
      recipientId: conversation.participants.find(p => p.userId.toString() !== req.user.id).userId,
      encryptedContent,
      iv,
      ephemeralPublicKey,
      messageHash,
      expiresAt: new Date(Date.now() + (conversation.paranoiaSettings.messageExpiration * 1000))
    });

    await message.save();
    await SecureConversation.findByIdAndUpdate(conversationId, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date()
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get conversation messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { startTime, limit = 50 } = req.query;

    let query = { $or: [{ senderId: req.user.id }, { recipientId: req.user.id }] };
    if (startTime) query.createdAt = { $lt: new Date(startTime) };

    const messages = await SecureMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark as read
    await SecureMessage.updateMany(
      { _id: { $in: messages.map(m => m._id) }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete message (paranoia mode)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await SecureMessage.findById(messageId);

    if (!message) return res.status(404).json({ success: false, error: 'Message not found' });
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// React to message
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await SecureMessage.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reactions: { userId: req.user.id, emoji, timestamp: new Date() }
        }
      },
      { new: true }
    );

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Enable/disable paranoia mode
exports.updateParanoiaSettings = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { settings } = req.body;

    const conversation = await SecureConversation.findByIdAndUpdate(
      conversationId,
      { paranoiaSettings: settings },
      { new: true }
    );

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get conversation list
exports.getConversations = async (req, res) => {
  try {
    const conversations = await SecureConversation.find({
      participants: { $elemMatch: { userId: req.user.id } }
    })
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
