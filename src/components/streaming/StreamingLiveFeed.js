"use client";

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, Divider, Avatar, IconButton } from '@mui/material';
import { ExpandMore, ShoppingCart } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function StreamingLiveFeed({ purchases = [] }) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = React.useState(null);

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
      });
    } catch {
      return 'Just now';
    }
  };

  const getPaymentColor = (method) => {
    const colors = {
      'Cash': 'default',
      'Credit Card': 'primary',
      'Debit Card': 'info',
      'Mobile Pay': 'success',
      'Fuel Card': 'warning'
    };
    return colors[method] || 'default';
  };

  if (!purchases.length) {
    return (
      <Box sx={{
        height: 500, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'text.secondary', p: 3, textAlign: 'center'
      }}>
        <ShoppingCart sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
        <Typography variant="h6">Waiting for transactions...</Typography>
        <Typography variant="body2">Live purchases will appear here in real-time</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 500, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">Live Transaction Feed</Typography>
        <Chip label={`${purchases.length} transactions`} size="small" variant="outlined" />
      </Box>
      <List disablePadding dense>
        {purchases.map((purchase, idx) => (
          <React.Fragment key={purchase.purchase_id || idx}>
            <ListItem
              sx={{
                px: 2, py: 1,
                borderBottom: idx < purchases.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                transition: 'background 0.2s',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expandedId === purchase.purchase_id ? null : purchase.purchase_id);
                  }}
                  size="small"
                >
                  <ExpandMore
                    style={{ transform: expandedId === purchase.purchase_id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </IconButton>
              }
            >
              <Avatar
                sx={{ width: 36, height: 36, bgcolor: 'primary.main', mr: 2 }}
              >
                <ShoppingCart fontSize="small" />
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {purchase.customer || purchase.customer_name || 'Unknown Customer'}
                    </Typography>
                    <Chip
                      label={`$${(purchase.total_amount || purchase.total || 0).toFixed(2)}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={purchase.payment_method}
                      size="small"
                      color={getPaymentColor(purchase.payment_method)}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(purchase.timestamp || purchase.purchase_timestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {(purchase.item_count || purchase.items?.length || 0)} items &bull; {purchase.purchase_id}
                  </Typography>
                }
              />
            </ListItem>

            {expandedId === purchase.purchase_id && (
              <Box sx={{ px: 4, pb: 2, bgcolor: 'grey.50' }}>
                <Divider variant="inset" component="div" sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {purchase.items?.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.8rem', color: 'text.secondary' }}>
                      <Typography sx={{ minWidth: 120, fontWeight: 500 }}>{item.product_name}</Typography>
                      <Typography sx={{ color: 'text.primary' }}>
                        {item.quantity} x ${item.unit_price?.toFixed(2)} = ${item.total_price?.toFixed(2)}
                      </Typography>
                      <Chip label={item.category} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
