import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  // 🎯 Detect if user is on a small screen (mobile)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 🔙 Handle back button (on mobile)
  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* 🧭 Show Sidebar on desktop or if no user selected */}
      {(!selectedUser || !isMobile) && (
        <Sidebar onSelectUser={setSelectedUser} />
      )}

      {/* 💬 Show ChatWindow only when user is selected */}
      {selectedUser && (
        <ChatWindow waId={selectedUser} onBack={isMobile ? handleBack : null} />
      )}

      {/* 🎉 Show welcome message if no chat selected (desktop only) */}
      {!selectedUser && !isMobile && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Select a conversation</h2>
        </Box>
      )}
    </Box>
  );
}

export default App;
