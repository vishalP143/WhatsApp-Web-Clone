const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// ✅ Add a new message
router.post('/add', async (req, res) => {
  try {
    const newMsg = new Message(req.body);
    await newMsg.save();
    res.status(201).json({ success: true, message: 'Message stored', data: newMsg });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json(messages);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update message status (sent, delivered, read)
router.put('/status/:id', async (req, res) => {
  try {
    const updated = await Message.findOneAndUpdate(
      { meta_msg_id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ Add or update emoji reaction
router.patch('/emoji/:id', async (req, res) => {
  try {
    const updated = await Message.findOneAndUpdate(
      { meta_msg_id: req.params.id },
      { emoji: req.body.emoji },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Emoji updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
