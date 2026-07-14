"use client";

import { Box, Typography, ThemeProvider, createTheme, CssBaseline, CircularProgress } from '@mui/material';
import StreamingDashboard from '@/components/streaming/StreamingDashboard';
import { StreamingProvider } from '@/services/streamingContext';

export default function LiveStreamPage() {
  return (
    <Box sx={{ height: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <CssBaseline />
      <StreamingProvider>
        <StreamingDashboard />
      </StreamingProvider>
    </Box>
  );
}
