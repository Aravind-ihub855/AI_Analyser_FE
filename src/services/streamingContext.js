import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import config from '@/services/config';

const StreamingContext = createContext(null);

export function StreamingProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [kpis, setKpis] = useState({ 
    total_revenue: 0, total_orders: 0, avg_order_value: 0, 
    low_stock_products: 0, active_customers: 0, total_products: 0 
  });
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [engineStats, setEngineStats] = useState({ running: true, purchases: 0, restocks: 0, errors: 0, current_rate: 5 });
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const getWsUrl = useCallback(() => {
    return config.STREAMING_WS_URL;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttempts.current = 0;
      console.log('Streaming WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Streaming WebSocket disconnected');
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('Streaming WebSocket error:', error);
    };
  }, [getWsUrl]);

  const handleMessage = useCallback((msg) => {
    const { type, data, event } = msg;
    const msgType = type || event;
    
    switch (msgType) {
      case 'kpi_update':
      case 'kpis':
        setKpis(prev => ({ ...prev, ...data }));
        break;
      case 'purchase_created':
        setRecentPurchases(prev => [data, ...prev.slice(0, 49)]);
        setKpis(prev => ({
          ...prev,
          total_revenue: prev.total_revenue + (data.total_amount || data.total || 0),
          total_orders: prev.total_orders + 1
        }));
        break;
      case 'engine_stats':
        setEngineStats(data);
        break;
      case 'restock_triggered':
        break;
      case 'top_products':
        if (Array.isArray(data)) setTopProducts(data);
        break;
      case 'inventory_snapshot':
        if (Array.isArray(data)) setInventory(data);
        break;
      case 'revenue_series':
        if (Array.isArray(data)) setRevenueSeries(data);
        break;
      default:
        if (msg.event === 'purchase_created') {
          handleMessage({ type: 'purchase_created', data: msg.data });
        }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <StreamingContext.Provider value={{
      connected,
      kpis,
      revenueSeries,
      topProducts,
      inventory,
      recentPurchases,
      engineStats,
      setEngineStats,
      setKpis,
      setRevenueSeries,
      setTopProducts,
      setInventory,
      connect,
      disconnect
    }}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreamingData() {
  const context = useContext(StreamingContext);
  if (!context) {
    throw new Error('useStreamingData must be used within a StreamingProvider');
  }
  return context;
}
