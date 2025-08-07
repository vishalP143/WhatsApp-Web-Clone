import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  Avatar,
  useTheme,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// 🎨 Helper: Generate consistent color from string (like wa_id)
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color =
    '#' +
    ((hash >> 24) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 16) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 8) & 0xff).toString(16).padStart(2, '0');
  return color;
}

function Sidebar({ onSelectUser, isSidebarOpen, setSidebarOpen }) {
  const [conversations, setConversations] = useState([]);
  const backendURL = 'https://whatsapp-web-clone-1yeh.onrender.com';
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    axios.get(`${backendURL}/api/messages`).then((res) => {
      const grouped = new Map();
      res.data.forEach((msg) => {
        if (!grouped.has(msg.wa_id)) {
          grouped.set(msg.wa_id, {
            name: msg.name || 'Unknown',
            wa_id: msg.wa_id,
            latest: msg.message,
            timestamp: msg.timestamp,
          });
        }
      });
      setConversations(Array.from(grouped.values()));
    });
  }, []);

  const handleUserClick = (waId) => {
    onSelectUser(waId);
    // Close sidebar on mobile after selecting user
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: isSidebarOpen ? '100%' : '0%', sm: '30%' },
        height: '100vh',
        overflowY: 'auto',
        transition: 'width 0.3s ease',
        position: { xs: 'absolute', sm: 'static' },
        zIndex: 1200,
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        borderRight: { sm: '1px solid #ddd' },
        display: isSidebarOpen || window.innerWidth >= 768 ? 'block' : 'none',
      }}
    >
      {/* 🧭 Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #ccc' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Chats
        </Typography>
        {/* Close button only for small screens */}
        {window.innerWidth < 768 && (
          <IconButton onClick={() => setSidebarOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* 📜 List of Conversations */}
      <List>
        {conversations.map((user) => (
          <React.Fragment key={user.wa_id}>
            <ListItem button onClick={() => handleUserClick(user.wa_id)} alignItems="flex-start">
              <Avatar sx={{ mr: 2, bgcolor: stringToColor(user.wa_id) }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color={isDarkMode ? '#ccc' : 'text.primary'}
                  >
                    {user.latest.length > 40 ? user.latest.slice(0, 40) + '...' : user.latest}
                  </Typography>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
