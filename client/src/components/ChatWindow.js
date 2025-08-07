import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

function formatDateLabel(date) {
  const today = new Date();
  const target = new Date(date);
  const diff = today.setHours(0, 0, 0, 0) - target.setHours(0, 0, 0, 0);
  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return target.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ChatWindow({ waId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const bottomRef = useRef(null);

  const backendURL = 'https://whatsapp-web-clone-1yeh.onrender.com';
  const emojiOptions = ['😄', '❤️', '👍', '👎', '😂'];

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/messages`);
        const userMsgs = res.data
          .filter(msg => msg.wa_id === waId)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(userMsgs);
      } catch (error) {
        console.error('Error fetching messages:', error.message);
      }
    };
    fetchMessages();
  }, [waId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const messageData = {
      wa_id: waId,
      name: 'You',
      message: newMessage,
      meta_msg_id: `local-${Date.now()}`,
      status: 'sent',
      timestamp: new Date(),
      emoji: ''
    };

    try {
      await axios.post(`${backendURL}/api/messages/add`, messageData);
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err.message);
    }
  };

  const handleReactionClick = (event, meta_msg_id) => {
    setAnchorEl(event.currentTarget);
    setSelectedMsgId(meta_msg_id);
  };

  const handleSelectEmoji = async (emoji) => {
    try {
      await axios.patch(`${backendURL}/api/messages/emoji/${selectedMsgId}`, { emoji });
      setMessages(prev =>
        prev.map(msg =>
          msg.meta_msg_id === selectedMsgId ? { ...msg, emoji } : msg
        )
      );
    } catch (err) {
      console.error('Failed to update emoji:', err.message);
    } finally {
      setAnchorEl(null);
      setSelectedMsgId(null);
    }
  };

  const groupedMessages = {};
  messages.forEach(msg => {
    const dateKey = new Date(msg.timestamp).toDateString();
    if (!groupedMessages[dateKey]) groupedMessages[dateKey] = [];
    groupedMessages[dateKey].push(msg);
  });

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#121212' : '#fafafa' }}>
      {/* 🔙 Back Button on mobile */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
        {onBack && (
          <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6">Chat with {waId}</Typography>
      </Box>

      {/* 💬 Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <Box key={date}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="textSecondary">
                {formatDateLabel(date)}
              </Typography>
            </Divider>
            {msgs.map((msg) => (
              <motion.div
                key={msg.meta_msg_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    maxWidth: '70%',
                    alignSelf: msg.name === 'You' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.name === 'You'
                      ? (isDarkMode ? '#2e7d32' : '#dcf8c6')
                      : (isDarkMode ? '#333' : '#fff'),
                    color: isDarkMode ? '#fff' : '#000',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      cursor: 'pointer',
                      position: 'absolute',
                      top: 4,
                      right: 6,
                      fontSize: '1.2rem',
                      opacity: 0.6
                    }}
                    onClick={(e) => handleReactionClick(e, msg.meta_msg_id)}
                  >
                    😊
                  </Box>

                  <Typography>{msg.message}</Typography>

                  {msg.emoji && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" component="span" sx={{ fontSize: '1.3rem' }}>
                        {msg.emoji}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: msg.status === 'read' ? '#1976d2' : '#888'
                      }}
                    >
                      {msg.status === 'read'
                        ? '✅✅'
                        : msg.status === 'delivered'
                        ? '✅✅'
                        : '✅'}
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            ))}
            <div ref={bottomRef}></div>
          </Box>
        ))}
      </Box>

      {/* 😊 Emoji Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {emojiOptions.map((emoji, i) => (
          <MenuItem key={i} onClick={() => handleSelectEmoji(emoji)}>
            {emoji}
          </MenuItem>
        ))}
      </Menu>

      {/* ⌨️ Input Field */}
      <Box sx={{ p: 2, borderTop: '1px solid #ccc', display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <IconButton onClick={handleSend} color="primary" sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatWindow;
