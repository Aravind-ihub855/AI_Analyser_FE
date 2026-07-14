import { useEffect, useRef, useState, useCallback } from 'react';

export function useStreamingWebSocket(url = null) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const baseUrl = url || (typeof window !== 'undefined' 
    ? `ws://${window.location.host}/streaming/ws` 
    : 'ws://localhost:8000/streaming/ws');

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const ws = new WebSocket(baseUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
        console.log('Streaming WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          setMessages(prev => [...prev.slice(-99), data]);
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
    } catch (e) {
      console.error('WebSocket creation failed:', e);
      setTimeout(connect, 5000);
    }
  }, [baseUrl]);

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

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connected, lastMessage, messages, send, connect, disconnect };
}

export function useStreamingData() {
  const { connected, lastMessage, messages } = useStreamingWebSocket();
  
  const [kpis, setKpis] = useState({ 
    total_revenue: 0, total_orders: 0, unique_customers: 0, low_stock_count: 0 
  });
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [engineStats, setEngineStats] = useState({ running: false, total_purchases: 0 });

  useEffect(() => {
    if (!lastMessage) return;
    
    const { type, data, event } = lastMessage;
    const msgType = type || event;
    
    switch (msgType) {
      case 'kpi_update':
        setKpis(prev => ({ ...prev, ...data }));
        break;
      case 'purchase_created':
        setRecentPurchases(prev => [data, ...prev.slice(0, 49)]);
        setKpis(prev => ({
          ...prev,
          total_revenue: prev.total_revenue + data.total_amount,
          total_orders: prev.total_orders + 1
        }));
        break;
      case 'stock_updated':
        setInventory(prev => 
          prev.map(p => p.product_id === data.product_id 
            ? { ...p, stock_quantity: data.stock_quantity }
            : p
          )
        );
        break;
      case 'initial_purchases':
        setRecentPurchases(data);
        break;
      case 'top_products':
        setTopProducts(data);
        break;
      case 'inventory_snapshot':
        setInventory(data);
        break;
      case 'engine_stats':
        setEngineStats(data);
        break;
    }
  }, [lastMessage]);

  return {
    connected,
    kpis,
    revenueSeries,
    topProducts,
    inventory,
    recentPurchases,
    engineStats,
    setRevenueSeries,
    setTopProducts,
    setInventory
  };
}