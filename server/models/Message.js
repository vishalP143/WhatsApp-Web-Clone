const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    wa_id: { type: String, required: true },
    name: { type: String },
    message: { type: String, required: true },
    status: { type: String, default: 'sent' },
    meta_msg_id: { type: String, unique: true },
    timestamp: { type: Date, default: Date.now }
}, { collection: 'processed_messages' }); // ✅ Force collection name

module.exports = mongoose.model('Message', MessageSchema);
