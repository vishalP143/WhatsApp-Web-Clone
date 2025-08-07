import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Box, useMediaQuery, IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Brightness4, Brightness7 } from '@mui/icons-material';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        
        {/* 🌗 Dark Mode Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flex: 1 }}>
          {(!selectedUser || !isMobile) && (
            <Sidebar onSelectUser={setSelectedUser} />
          )}

          {selectedUser && (
            <ChatWindow waId={selectedUser} onBack={isMobile ? handleBack : null} />
          )}

          {!selectedUser && !isMobile && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2>Select a conversation</h2>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
