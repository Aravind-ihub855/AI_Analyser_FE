"use client";

import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';

export default function StreamingRevenueChart({ data, height = 400 }) {
  const chartData = React.useMemo(() => {
    if (!data?.length) return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19-i)*60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      revenue: 0,
      orders: 0
    }));
    return data.map(d => ({
      time: d._id || d.time,
      revenue: d.revenue || 0,
      orders: d.orders || 0
    }));
  }, [data]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9ca3af' }}
            tickFormatter={v => `$${(v/1000).toFixed(v>=1000?1:0)}k`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#fff' }}
            formatter={(value, name) => [value, name === 'revenue' ? 'Revenue' : 'Orders']}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
