"use client";

import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export default function StreamingProductSalesChart({ data, height = 400 }) {
  const chartData = React.useMemo(() =>
    data?.length ? data : Array.from({ length: 5 }, (_, i) => ({
      _id: `prod-${i}`,
      product_name: `Product ${i+1}`,
      category: 'General',
      total_quantity: 0,
      total_revenue: 0
    }))
  , [data]);

  return (
    <div style={{ width: '100%', height, display: 'flex', gap: 16 }}>
      <div style={{ width: '50%', minWidth: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.slice(0, 8)}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="total_revenue"
              nameKey="product_name"
              label={({ product_name, total_revenue, percent }) =>
                `${product_name}: ${(percent * 100).toFixed(1)}%`
              }
              labelLine={false}
            >
              {chartData.slice(0, 8).map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: '50%', minWidth: 250 }}>
        <TableContainer style={{ maxHeight: '100%', overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chartData.slice(0, 10).map((item, idx) => (
                <TableRow key={item._id} hover>
                  <TableCell component="th" scope="row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 10, height: 10, borderRadius: '50%',
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {item.product_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="right">{item.total_quantity?.toLocaleString() || 0}</TableCell>
                  <TableCell align="right">${(item.total_revenue || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
