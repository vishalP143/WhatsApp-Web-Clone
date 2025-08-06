const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('../models/Message');

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const payloadDir = path.join(__dirname, 'payloads');

// ✅ Read all JSON files from payloads folder
fs.readdirSync(payloadDir).forEach(async file => {
    if (file.endsWith('.json')) {
        console.log(`🔍 Processing file: ${file}`);

        const data = JSON.parse(fs.readFileSync(path.join(payloadDir, file), 'utf-8'));

        // ✅ Extract WhatsApp webhook data from the payload
        try {
            const changes = data?.metaData?.entry?.[0]?.changes?.[0]?.value;
            if (!changes) {
                console.log(`⚠️ No valid changes in ${file}`);
                return;
            }

            const contact = changes.contacts?.[0];
            const messages = changes.messages || [];

            for (const msg of messages) {
                const messageData = {
                    wa_id: contact?.wa_id || 'unknown',
                    name: contact?.profile?.name || 'Unknown User',
                    message: msg?.text?.body || '',
                    status: 'sent', // Default as sent
                    meta_msg_id: msg?.id,
                    timestamp: new Date(parseInt(msg?.timestamp) * 1000)
                };

                await Message.updateOne(
                    { meta_msg_id: msg.id },
                    messageData,
                    { upsert: true }
                );
                console.log(`✅ Inserted message: ${msg.id}`);
            }
        } catch (err) {
            console.error(`❌ Error processing file ${file}:`, err.message);
        }
    }
});

console.log('🎯 Payload processing completed.');
