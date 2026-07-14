"use client";

import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell
} from 'recharts';
import { Box, Chip } from '@mui/material';

export default function StreamingInventoryChart({ data, height = 350 }) {
  const chartData = React.useMemo(() => {
    if (!data?.length) return [];
    return data
      .map(d => {
        const currentStock = parseInt(d.currentStock, 10) || 0;
        const rol = parseInt(d.rol, 10) || 0;
        let status = 'OK';
        if (currentStock <= rol) status = 'Critical';
        else if (currentStock <= rol * 2) status = 'Low';

        return {
          name: d.name || 'Unknown',
          stock: currentStock,
          threshold: rol,
          category: d.category || '',
          status
        };
      })
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 15);
  }, [data]);

  if (!chartData.length) {
    return (
      <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        No inventory data available
      </Box>
    );
  }

  const colors = chartData.map(d =>
    d.status === 'Critical' ? '#ef4444' : d.status === 'Low' ? '#f59e0b' : '#10b981'
  );

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 320, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={300}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#fff' }}
            formatter={(value, name) => {
              if (name === 'stock') return [value, 'Current Stock'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            dataKey="stock"
            name="Current Stock"
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Box sx={{ mt: 1, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Chip icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />} label="Critical" size="small" variant="outlined" color="error" />
        <Chip icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />} label="Low" size="small" variant="outlined" color="warning" />
        <Chip icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />} label="OK" size="small" variant="outlined" color="success" />
      </Box>
    </div>
  );
}
