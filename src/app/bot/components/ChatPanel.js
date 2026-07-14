"use client";

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Avatar,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
  Button
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import PublicIcon from '@mui/icons-material/Public';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TokenBadge = ({ metadata, tools_used }) => {
  if (!metadata && (!tools_used || tools_used.length === 0)) return null;
  const { model, token_usage } = metadata || {};
  const total = token_usage?.total_tokens;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      mt: 0.75,
      px: 0.5,
      flexWrap: 'wrap'
    }}>
      {model && (
        <Chip
          label={model}
          size="small"
          sx={{
            fontSize: '9px',
            height: '18px',
            bgcolor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            fontWeight: 600,
            letterSpacing: '0.02em',
            '& .MuiChip-label': { px: 0.75 }
          }}
        />
      )}
      {total > 0 && (
        <Tooltip title={`Prompt: ${token_usage.prompt_tokens} | Completion: ${token_usage.completion_tokens}`} arrow>
          <Chip
            label={`${total.toLocaleString()} tokens`}
            size="small"
            sx={{
              fontSize: '9px',
              height: '18px',
              bgcolor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              fontWeight: 600,
              cursor: 'help',
              '& .MuiChip-label': { px: 0.75 }
            }}
          />
        </Tooltip>
      )}
      {tools_used && tools_used.map((tool, idx) => (
        <Chip
          key={idx}
          label={tool}
          size="small"
          sx={{
            fontSize: '9px',
            height: '18px',
            bgcolor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            fontWeight: 500,
            '& .MuiChip-label': { px: 0.75 }
          }}
        />
      ))}
    </Box>
  );
};

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
        maxWidth: '95%'
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
              '& strong': { fontWeight: 700 },
              '& p': { m: 0, lineHeight: 1.6 },
              '& ul, & ol': { pl: 2, mt: 1 },
              '& li': { mb: 0.5 },
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
            {isBot && message.tableData && message.tableData.headers && (
              <Box sx={{ 
                mt: 1.5, 
                overflowX: 'auto', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                maxWidth: '100%',
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '10px' }
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'inherit' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {message.tableData.headers.map((h, i) => (
                        <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                          {h.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.tableData.rows.map((row, ri) => (
                      <tr key={ri} style={{ 
                        borderBottom: ri === message.tableData.rows.length - 1 ? 'none' : '1px solid #f1f5f9',
                        backgroundColor: ri % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                        {row.map((val, ci) => (
                          <td key={ci} style={{ padding: '8px 10px', color: '#475569', whiteSpace: 'nowrap' }}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          </Typography>
          {/* Token Usage & Tools Badge — only for AI messages */}
          {isBot && <TokenBadge metadata={message.metadata} tools_used={message.tools_used} />}
        </Box>
      </Box>
    </Box>
  );
};

const PersonaBanner = ({ currentUser }) => {
  if (!currentUser) return null;
  const role = currentUser.role || '';
  const isStoreManager = role === 'store manager';
  const isVendorManager = role === 'vendor manager';
  const isSuperAdmin = role === 'super admin';

  if (!isStoreManager && !isVendorManager && !isSuperAdmin) return null;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 3,
      py: 1,
      bgcolor: isStoreManager ? '#eff6ff' : isVendorManager ? '#fefce8' : '#f0fdf4',
      borderBottom: '1px solid',
      borderColor: isStoreManager ? '#bfdbfe' : isVendorManager ? '#fde68a' : '#bbf7d0',
    }}>
      {isStoreManager && (
        <>
          <StoreIcon sx={{ fontSize: 14, color: '#2563eb' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#1e40af' }}>
            Store Manager
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#3b82f6' }}>
            — Viewing data for store:
          </Typography>
          <Chip
            label={currentUser.storeId || 'N/A'}
            size="small"
            sx={{ fontSize: '10px', height: '18px', bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, '& .MuiChip-label': { px: 1 } }}
          />
        </>
      )}
      {isVendorManager && (
        <>
          <PublicIcon sx={{ fontSize: 14, color: '#d97706' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#92400e' }}>
            Vendor Manager
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#b45309' }}>
            — Region:
          </Typography>
          <Chip
            label={currentUser.region || 'N/A'}
            size="small"
            sx={{ fontSize: '10px', height: '18px', bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, '& .MuiChip-label': { px: 1 } }}
          />
        </>
      )}
      {isSuperAdmin && (
        <>
          <PublicIcon sx={{ fontSize: 14, color: '#059669' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#065f46' }}>
            Super Admin
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#10b981' }}>
            — Full access across all stores & regions
          </Typography>
        </>
      )}
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
  onShowData,
  currentUser,
  progressMessage
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
      {/* Header */}
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', letterSpacing: '0.025em', fontSize: '12px' }}>
            BP STORE MANAGER AI COPILOT
          </Typography>
          {currentUser?.name && (
            <Typography sx={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
              {currentUser.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {syncing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', gap: 1 }}>
              <CircularProgress size={14} sx={{ color: 'primary.main' }} />
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary' }}>
                Syncing Database...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isSynced && (
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', mr: 0.5 }}>
                  Synced ✓
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleSync}
                startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  py: 0.5,
                  px: 1.5,
                  borderRadius: '8px',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    backgroundColor: '#f8fafc',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Sync DB
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Persona Banner */}
      <PersonaBanner currentUser={currentUser} />

      {/* Messages */}
      <Box sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: '#cbd5e1' }
      }}>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} onShowData={onShowData} />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 6, mb: 2 }}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.015em' }}>
              {progressMessage || "Agent is thinking..."}
            </Typography>
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
