"use client";

import React, { useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import PercentIcon from '@mui/icons-material/Percent';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';

import {
    BarChart, Bar,
    LineChart, Line,
    AreaChart, Area,
    PieChart, Pie, Cell,
    ComposedChart,
    XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend, ResponsiveContainer
} from 'recharts';

// --- Color Palette ---
const COLORS = ['#059669', '#2563eb', '#7c3aed', '#db2777', '#f59e0b', '#06b6d4', '#e11d48', '#8b5cf6'];

// --- Icon Map ---
const ICON_MAP = {
    revenue: <PointOfSaleIcon sx={{ fontSize: 28 }} />,
    purchases: <ShoppingCartIcon sx={{ fontSize: 28 }} />,
    tax: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
    customers: <PeopleIcon sx={{ fontSize: 28 }} />,
    vendors: <StorefrontIcon sx={{ fontSize: 28 }} />,
    entries: <AssessmentIcon sx={{ fontSize: 28 }} />,
    profit: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    invoices: <ReceiptLongIcon sx={{ fontSize: 28 }} />,
    money: <AttachMoneyIcon sx={{ fontSize: 28 }} />,
    category: <CategoryIcon sx={{ fontSize: 28 }} />,
    percentage: <PercentIcon sx={{ fontSize: 28 }} />,
    chart: <ShowChartIcon sx={{ fontSize: 28 }} />,
    payment: <PaymentsIcon sx={{ fontSize: 28 }} />,
    shipping: <LocalShippingIcon sx={{ fontSize: 28 }} />,
    user: <AccountCircleIcon sx={{ fontSize: 28 }} />,
    receipt: <ReceiptIcon sx={{ fontSize: 28 }} />,
    inventory: <InventoryIcon sx={{ fontSize: 28 }} />
};

// --- KPI Card ---
const KpiCard = ({ kpi, index }) => {
    const icon = ICON_MAP[kpi.icon] || ICON_MAP.invoices;
    const isUp = kpi.trendDirection === 'up';
    const isDown = kpi.trendDirection === 'down';
    const trendColor = isUp ? '#059669' : isDown ? '#e11d48' : '#64748b';
    const accentColor = COLORS[index % COLORS.length];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                minWidth: 180,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transform: 'translateY(-2px)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: accentColor,
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                        {kpi.label}
                    </Typography>
                    <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                        {kpi.value}
                    </Typography>
                    {/* {kpi.trend &&
                        String(kpi.trend).toUpperCase() !== 'N/A' &&
                        String(kpi.trend).toUpperCase() !== 'NULL' &&
                        String(kpi.trend).trim() !== '-' &&
                        String(kpi.trend).trim() !== '' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                                {isUp ? <TrendingUpIcon sx={{ fontSize: 16, color: trendColor }} /> :
                                    isDown ? <TrendingDownIcon sx={{ fontSize: 16, color: trendColor }} /> :
                                        <RemoveIcon sx={{ fontSize: 16, color: trendColor }} />}
 
                            </Box>
                        )} */}
                </Box>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${accentColor}12`,
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
};

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', minWidth: 150 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{label}</Typography>
            {payload.map((entry, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
                        {entry.name}: <strong style={{ color: '#1e293b' }}>{typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}</strong>
                    </Typography>
                </Box>
            ))}
        </Paper>
    );
};

// --- Chart Renderer ---
const DashboardChart = ({ chart }) => {
    const { type, title, data, xKey, series, dataKey, nameKey } = chart;

    if (!data || data.length === 0) return null;

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            {(series || []).map((s, i) => (
                                <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'stackedBar':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            {(series || []).map((s, i) => (
                                <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || COLORS[i % COLORS.length]} stackId="stack" radius={i === (series.length - 1) ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            {(series || []).map((s, i) => (
                                <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 4, fill: s.color || COLORS[i % COLORS.length] }} activeDot={{ r: 6 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                {(series || []).map((s, i) => (
                                    <linearGradient key={s.dataKey} id={`gradient-${chart.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0.02} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            {(series || []).map((s, i) => (
                                <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={2} fill={`url(#gradient-${chart.id}-${i})`} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey={dataKey || 'value'}
                                nameKey={nameKey || 'name'}
                                cx="50%"
                                cy="50%"
                                outerRadius={95}
                                innerRadius={50}
                                paddingAngle={3}
                                strokeWidth={0}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                            >
                                {data.map((entry, i) => (
                                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'composedBar':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            {(series || []).map((s, i) => {
                                if (i === 0) {
                                    return <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />;
                                }
                                return <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} />;
                            })}
                        </ComposedChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            {(series || []).map((s, i) => (
                                <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                transition: 'all 0.2s ease',
                animation: 'chartFadeIn 0.4s ease-out',
                '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }
            }}
        >
            <Typography sx={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                mb: 1.5,
                pl: 0.5,
                borderLeft: `3px solid ${COLORS[parseInt(chart.id?.replace(/\D/g, '') || '0') % COLORS.length]}`,
                paddingLeft: '10px'
            }}>
                {title}
            </Typography>
            {renderChart()}
        </Paper>
    );
};

// --- Main Dashboard Panel ---
const DashboardPanel = ({ data, dashboardRef }) => {
    if (!data) return null;

    const { title, kpis, charts } = data;

    return (
        <Box
            ref={dashboardRef}
            sx={{
                flex: 1,
                animation: 'dashboardFadeIn 0.5s ease-out',
            }}
        >
            {/* Dashboard Title */}
            <Box sx={{ mb: 2.5, px: 0.5 }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                    {title || 'Financial Dashboard'}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>

                </Typography>
            </Box>

            {/* KPI Cards Row */}
            {kpis && kpis.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                    mb: 3,
                }}>
                    {kpis.map((kpi, i) => (
                        <KpiCard key={i} kpi={kpi} index={i} />
                    ))}
                </Box>
            )}

            {/* Charts Grid */}
            {charts && charts.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2,
                }}>
                    {charts.map((chart, i) => (
                        <DashboardChart key={chart.id || i} chart={chart} />
                    ))}
                </Box>
            )}

            <style jsx>{`
        @keyframes dashboardFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chartFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </Box>
    );
};

export default DashboardPanel;
