"use client";

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, onShowData }) => {
  const isBot = message.role === 'assistant';
  const hasData = message.tableData || message.chartData || message.reportData || message.dashboardData;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isBot ? 'flex-start' : 'flex-end',
      mb: 3,
      width: '100%'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: isBot ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        maxWidth: '85%'
      }}>
        <Avatar sx={{
          bgcolor: isBot ? 'primary.main' : '#f1f5f9',
          mr: isBot ? 1.5 : 0,
          ml: isBot ? 0 : 1.5,
          width: 32,
          height: 32,
          flexShrink: 0,
          border: '1px solid',
          borderColor: isBot ? 'primary.main' : '#e2e8f0'
        }}>
          {isBot ? <SmartToyIcon fontSize="small" /> : <PersonIcon fontSize="small" sx={{ color: '#64748b' }} />}
        </Avatar>
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: isBot ? 'flex-start' : 'flex-end' }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              px: 2,
              bgcolor: isBot ? '#f8fafc' : 'primary.main',
              color: isBot ? 'text.primary' : 'white',
              borderRadius: isBot ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
              border: '1px solid',
              borderColor: isBot ? '#e2e8f0' : 'primary.main',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              '& strong': {
                fontWeight: 700,
              },
              '& p': {
                m: 0,
                lineHeight: 1.6,
              },
              '& ul, & ol': {
                pl: 2,
                mt: 1,
              },
              '& li': {
                mb: 0.5,
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                mb: 1.5,
                mt: 1,
                border: '1px solid #e2e8f0',
                fontSize: '12px'
              },
              '& th, & td': {
                p: 1,
                border: '1px solid #e2e8f0',
                textAlign: 'left'
              },
              '& th': {
                bgcolor: isBot ? '#f1f5f9' : 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <div style={{ wordBreak: 'break-word', fontSize: '13px' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
            {isBot && hasData && !message.content.toLowerCase().startsWith("i'm sorry, i encountered") && (
              <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton 
                  size="small" 
                  onClick={() => onShowData(message)}
                  sx={{ 
                    fontSize: '10px', 
                    borderRadius: 1, 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  View Result
                </IconButton>
              </Box>
            )}
          </Paper>
          <Typography variant="caption" sx={{
            mt: 0.5,
            px: 0.5,
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '10px',
            display: 'block',
            textAlign: isBot ? 'left' : 'right'
          }}>
            {isBot ? 'Finance AI Agent' : 'You'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const ChatPanel = ({
  messages,
  input,
  setInput,
  handleSubmit,
  loading,
  messagesEndRef,
  handleSync,
  syncing,
  isSynced,
  onShowData
}) => {
  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'white',
      borderRadius: 4,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      height: '100%',
      minHeight: 0
    }}>
      <Box sx={{
        p: 0,
        px: 3,
        minHeight: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f8fafc',
        bgcolor: '#ffffff'
      }}>
        {/* <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', letterSpacing: '0.025em', fontSize: '12px' }}>FINANCE AI AGENT</Typography> */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', letterSpacing: '0.025em', fontSize: '12px' }}>FINANCE AI AGENT</Typography>
        {syncing && (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <CircularProgress size={12} sx={{ mr: 1 }} />
            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>Syncing Database...</Typography>
          </Box>
        )}
        {!syncing && isSynced && (
          <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center' }}>
            Synced ✓
          </Typography>
        )}
      </Box>

      <Box sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        /* Custom Scrollbar Styles */
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#e2e8f0',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#cbd5e1',
        }
      }}>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} onShowData={onShowData} />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 6, mb: 2 }}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Agent is thinking...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, px: 3, pt: 1.5, borderTop: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            bgcolor: !isSynced ? '#f1f5f9' : '#f8fafc',
            opacity: !isSynced ? 0.7 : 1,
            '&:focus-within': {
              borderColor: 'primary.main',
              bgcolor: '#ffffff',
              boxShadow: '0 0 0 2px rgba(33, 125, 240, 0.05)'
            }
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            disabled={!isSynced || loading}
            placeholder={syncing ? "Optimizing knowledge base..." : (isSynced ? "Ask about your data..." : "Initializing...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
            InputProps={{ disableUnderline: true, sx: { fontSize: '13px' } }}
          />
          <IconButton
            color="primary"
            type="submit"
            disabled={!input.trim() || loading || !isSynced}
            size="small"
            sx={{
              bgcolor: (input.trim() && isSynced) ? 'primary.main' : 'transparent',
              color: (input.trim() && isSynced) ? 'white' : 'action.disabled',
              '&:hover': { bgcolor: (input.trim() && isSynced) ? 'primary.dark' : 'transparent' }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatPanel;
