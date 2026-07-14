"use client";

import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Alert, Tabs, Tab, Button, CircularProgress, Chip } from '@mui/material';
import { PlayArrow, Pause, Refresh, Speed } from '@mui/icons-material';
import { useStreamingData } from '@/services/streamingContext';
import config from '@/services/config';
import StreamingRevenueChart from './StreamingRevenueChart';
import StreamingProductSalesChart from './StreamingProductSalesChart';
import StreamingInventoryChart from './StreamingInventoryChart';
import StreamingLiveFeed from './StreamingLiveFeed';

export default function StreamingDashboard() {
  const { connected, kpis, revenueSeries, topProducts, inventory, recentPurchases, engineStats, setKpis, setRevenueSeries, setTopProducts, setInventory, setEngineStats } = useStreamingData();
  const [activeTab, setActiveTab] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_API_URL = config.FINANCE_AI_Base_url;

  const fetchData = async () => {
    try {
      const [kpiRes, revRes, topRes, invRes] = await Promise.all([
          fetch(`${BASE_API_URL}/streaming/kpis`).then(r => r.json()).catch(() => ({})),
          fetch(`${BASE_API_URL}/streaming/revenue/series?minutes=60`).then(r => r.json()).catch(() => []),
          fetch(`${BASE_API_URL}/streaming/products/top?limit=20`).then(r => r.json()).catch(() => []),
          fetch(`${BASE_API_URL}/streaming/inventory/snapshot?limit=50`).then(r => r.json()).catch(() => []),
        ]);
        if (kpiRes?.total_orders != null) setKpis(kpiRes);
        if (revRes?.length) setRevenueSeries(revRes);
        if (topRes?.length) setTopProducts(topRes);
        if (invRes?.length) setInventory(invRes);
    } catch (e) {
      console.error('Data fetch failed:', e);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
      setInitialLoad(false);
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleEngineControl = async (action) => {
    try {
      const res = await fetch(`${BASE_API_URL}/streaming/engine/${action}`, { method: 'POST' });
      if (res.ok) {
        const statsRes = await fetch(`${BASE_API_URL}/streaming/engine/stats`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setEngineStats(stats);
        }
      }
    } catch (e) {
      console.error('Engine control failed:', e);
    }
  };

  const running = engineStats.running ?? true;

  if (!connected && initialLoad) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6">Connecting to streaming engine...</Typography>
        <Typography variant="body2" color="text.secondary">Establishing WebSocket connection</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: { xs: 1, md: 2 }, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Live Streaming Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<Speed sx={{ fontSize: 16, color: connected ? 'success.main' : 'error.main' }} />}
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ p: { xs: 1, md: 2 }, mb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                ${(kpis.total_revenue || 0).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Total Orders</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {(kpis.total_orders || 0).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Avg Order Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                ${(kpis.avg_order_value || 0).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Low Stock Items</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: (kpis.low_stock_products || 0) > 0 ? 'error.main' : 'success.main' }}>
                {kpis.low_stock_products || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Alert severity="info" sx={{ mx: { xs: 1, md: 2 }, mb: 2 }} variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Speed sx={{ color: running ? 'success.main' : 'error.main' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Streaming Engine: <strong>{running ? 'Running' : 'Stopped'}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ~{engineStats.current_rate || 5} tx/sec &bull; {(engineStats.purchases || 0).toLocaleString()} processed &bull; {engineStats.restocks || 0} restocks
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={running ? 'outlined' : 'contained'}
              startIcon={running ? <Pause /> : <PlayArrow />}
              onClick={() => handleEngineControl(running ? 'stop' : 'start')}
              disabled={engineStats.running === undefined}
            >
              {running ? 'Pause Stream' : 'Start Stream'}
            </Button>
            <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>
        </Box>
      </Alert>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mx: { xs: 1, md: 2 }, mb: 2 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Overview" />
        <Tab label="Products" />
        <Tab label="Inventory" />
        <Tab label="Live Feed" />
      </Tabs>

      <Grid container spacing={2} sx={{ flex: 1, overflow: 'auto', p: { xs: 1, md: 2 } }}>
        {activeTab === 0 && (
          <>
            <Grid item xs={12} lg={7}>
              <Paper elevation={2} sx={{ p: 2, height: 420 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Revenue Stream (Last 60 min)</Typography>
                <StreamingRevenueChart data={revenueSeries} height={360} />
              </Paper>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Paper elevation={2} sx={{ p: 2, height: 420 }}>
                <StreamingProductSalesChart data={topProducts} height={380} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, height: 380 }}>
                <StreamingInventoryChart data={inventory} height={340} />
              </Paper>
            </Grid>
          </>
        )}

        {activeTab === 1 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2, height: 550 }}>
              <StreamingProductSalesChart data={topProducts} height={510} />
            </Paper>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2, height: 550 }}>
              <StreamingInventoryChart data={inventory} height={510} />
            </Paper>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ height: 550 }}>
              <StreamingLiveFeed purchases={recentPurchases} />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
