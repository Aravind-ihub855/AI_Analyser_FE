"use client";

import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DashboardPanel from './DashboardPanel';

const ChatTable = ({ data }) => {
  if (!data || !data.headers || !data.rows) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
      <Typography variant="body2">No table data available.</Typography>
    </Box>
  );

  // Filter out internal ID columns
  const excludedColumns = ['id', '_id'];
  const visibleHeaderIdxs = data.headers
    .map((h, i) => excludedColumns.includes(h.toLowerCase()) ? -1 : i)
    .filter(i => i !== -1);

  const visibleHeaders = visibleHeaderIdxs.map(i => data.headers[i]);

  const formatHeader = (header) => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderCellContent = (content) => {
    if (content === null || content === undefined) return '-';
    if (typeof content !== 'string') return String(content);

    // Check if it looks like stringified JSON
    if ((content.startsWith('[') && content.endsWith(']')) || (content.startsWith('{') && content.endsWith('}'))) {
      try {
        // Handle MongoDB-style Python stringified dicts/lists (using single quotes)
        const normalizedJson = content.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
        const parsed = JSON.parse(normalizedJson);

        if (Array.isArray(parsed)) {
          return (
            <Box component="ul" sx={{ m: 0, p: 0, pl: 2, fontSize: '12px', color: '#475569' }}>
              {parsed.map((item, i) => {
                // If item is an object, try to find a descriptive key
                if (typeof item === 'object' && item !== null) {
                  const desc = item.description || item.name || item.product_name || item.item_name || JSON.stringify(item);
                  return <li key={i}>{desc}</li>;
                }
                return <li key={i}>{String(item)}</li>;
              })}
            </Box>
          );
        } else if (typeof parsed === 'object' && parsed !== null) {
          // If it's an object, render key-value pairs cleanly
          return (
            <Box sx={{ fontSize: '11px', color: '#64748b' }}>
              {Object.entries(parsed).map(([key, val], i) => (
                <Box key={i} sx={{ mb: 0.5 }}>
                  <Typography component="span" sx={{ fontWeight: 600, fontSize: '11px', color: '#1e293b' }}>
                    {key.replace(/_/g, ' ')}:
                  </Typography> {String(val)}
                </Box>
              ))}
            </Box>
          );
        }
      } catch (e) {
        // If parsing fails (e.g. contains nested quotes that aren't handled), fall back to a cleaner string
        return content.replace(/['"{}[\]]/g, ' ').substring(0, 100) + (content.length > 100 ? '...' : '');
      }
    }

    return content;
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{
      border: '1px solid #e2e8f0',
      overflowX: 'auto',
      width: '100%',
      borderRadius: 2,
      maxHeight: '100%'
    }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {visibleHeaders.map((header, idx) => (
              <TableCell
                key={idx}
                sx={{
                  fontWeight: 700,
                  bgcolor: '#f8fafc',
                  color: '#1e293b',
                  fontSize: '11px',
                  py: 1.5,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  minWidth: '100px',
                  borderBottom: '2px solid #e2e8f0'
                }}
              >
                {formatHeader(header)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.rows.map((row, rowIdx) => (
            <TableRow key={rowIdx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {visibleHeaderIdxs.map((cellIdx) => (
                <TableCell key={cellIdx} sx={{
                  fontSize: '12px',
                  py: 1.5,
                  minWidth: '150px',
                  maxWidth: '450px',
                  verticalAlign: 'top'
                }}>
                  {renderCellContent(row[cellIdx])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DisplayPanel = ({
  activeView,
  setActiveView,
  currentTable,
  currentChart,
  currentReport,
  currentDashboard
}) => {
  const reportRef = useRef(null);
  const dashboardRef = useRef(null);

  const handleDownload = async () => {
    if (activeView === 'chart' && currentChart) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${currentChart}`;
      link.download = `viz_${new Date().getTime()}.png`;
      link.click();
    } else if (activeView === 'report' && currentReport && reportRef.current) {
      try {
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`report_${new Date().getTime()}.pdf`);
      } catch (err) {
        console.error("PDF Export failed:", err);
        // Fallback to text download if PDF fails
        const blob = new Blob([currentReport], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${new Date().getTime()}.md`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } else if (activeView === 'table' && currentTable) {
      // Simple CSV conversion
      const headers = currentTable.headers.join(',');
      const rows = currentTable.rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data_${new Date().getTime()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (activeView === 'dashboard' && currentDashboard && dashboardRef.current) {
      try {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`dashboard_${new Date().getTime()}.pdf`);
      } catch (err) {
        console.error("Dashboard PDF Export failed:", err);
      }
    }
  };

  return (
    <Box sx={{
      flex: 1.2,
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
        borderBottom: '1px solid #f8fafc',
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', letterSpacing: '0.025em', fontSize: '12px' }}>ANALYTICS & DATA</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

          <Box sx={{ display: 'flex', gap: 1, mr: 2, borderRight: '1px solid #f1f5f9', pr: 2 }}>
            <Tooltip title={activeView === 'report' ? "Download as PDF" : "Download as File"}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleDownload}
                  disabled={
                    (activeView === 'table' && !currentTable) ||
                    (activeView === 'chart' && !currentChart) ||
                    (activeView === 'report' && !currentReport) ||
                    (activeView === 'dashboard' && !currentDashboard)
                  }
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    color: '#64748b',
                    '&:hover': { bgcolor: '#f1f5f9', color: 'primary.main' }
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <IconButton
            size="small"
            onClick={() => setActiveView('table')}
            disabled={!currentTable}
            sx={{
              borderRadius: 2,
              p: 1,
              bgcolor: activeView === 'table' ? '#eef2ff' : 'transparent',
              color: activeView === 'table' ? 'primary.main' : '#94a3b8',
              border: activeView === 'table' ? '1px solid' : '1px solid transparent',
              borderColor: 'primary.light',
              '&:hover': { bgcolor: activeView === 'table' ? '#eef2ff' : '#f1f5f9' }
            }}
          >
            <TableChartIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setActiveView('chart')}
            disabled={!currentChart}
            sx={{
              borderRadius: 2,
              p: 1,
              bgcolor: activeView === 'chart' ? '#eef2ff' : 'transparent',
              color: activeView === 'chart' ? 'primary.main' : '#94a3b8',
              border: activeView === 'chart' ? '1px solid' : '1px solid transparent',
              borderColor: 'primary.light',
              '&:hover': { bgcolor: activeView === 'chart' ? '#eef2ff' : '#f1f5f9' }
            }}
          >
            <BarChartIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setActiveView('report')}
            disabled={!currentReport}
            sx={{
              borderRadius: 2,
              p: 1,
              bgcolor: activeView === 'report' ? '#eef2ff' : 'transparent',
              color: activeView === 'report' ? 'primary.main' : '#94a3b8',
              border: activeView === 'report' ? '1px solid' : '1px solid transparent',
              borderColor: 'primary.light',
              '&:hover': { bgcolor: activeView === 'report' ? '#eef2ff' : '#f1f5f9' }
            }}
          >
            <DescriptionIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setActiveView('dashboard')}
            disabled={!currentDashboard}
            sx={{
              borderRadius: 2,
              p: 1,
              bgcolor: activeView === 'dashboard' ? '#eef2ff' : 'transparent',
              color: activeView === 'dashboard' ? 'primary.main' : '#94a3b8',
              border: activeView === 'dashboard' ? '1px solid' : '1px solid transparent',
              borderColor: 'primary.light',
              '&:hover': { bgcolor: activeView === 'dashboard' ? '#eef2ff' : '#f1f5f9' }
            }}
          >
            <DashboardCustomizeIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Right Panel Content */}
      <Box sx={{
        flexGrow: 1,
        p: 2,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
        /* Custom Scrollbar Styles */
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
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
        {!currentTable && !currentChart && !currentReport && !currentDashboard ? (
          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <AutoGraphIcon sx={{ fontSize: 60, mb: 1.5, color: '#cbd5e1' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>Visualization or Report will appear here</Typography>
          </Box>
        ) : (
          <>
            {activeView === 'report' && currentReport && (
              <Box
                ref={reportRef}
                sx={{
                  flex: 1,
                  bgcolor: 'white',
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  animation: 'fadeIn 0.3s ease-in-out',
                  '& h1': { color: '#0f172a', mt: 4, mb: 2, fontWeight: 800, fontSize: '20px', borderBottom: '2px solid #e2e8f0', pb: 1 },
                  '& h2': { color: '#1e293b', mt: 3.5, mb: 1.5, fontWeight: 700, fontSize: '17px', textTransform: 'uppercase', letterSpacing: '0.05em' },
                  '& h3': { color: '#334155', mt: 3, mb: 1, fontWeight: 700, fontSize: '15px' },
                  '& p': { color: '#475569', lineHeight: 1.8, mb: 2.5, fontSize: '14px' },
                  '& li': { color: '#475569', mb: 1.2, fontSize: '14px', lineHeight: 1.6 },
                  '& strong': { color: '#0f172a', fontWeight: 700, bgcolor: 'rgba(241, 245, 249, 0.5)', px: 0.5, borderRadius: '3px' },
                  '& hr': { border: 'none', height: '2px', bgcolor: '#f1f5f9', my: 4, borderRadius: '2px' },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    mb: 3,
                    mt: 2,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  },
                  '& th': {
                    bgcolor: '#f8fafc',
                    color: '#1e293b',
                    fontWeight: 700,
                    textAlign: 'left',
                    p: 1.5,
                    borderBottom: '2px solid #e2e8f0'
                  },
                  '& td': {
                    p: 1.5,
                    borderBottom: '1px solid #f1f5f9',
                    color: '#475569'
                  },
                  '& tr:last-child td': {
                    borderBottom: 'none'
                  },
                  '& tr:nth-of-type(even)': {
                    bgcolor: '#fafafa'
                  },
                  '& a': {
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    margin: '16px 0',
                    border: '1px solid #e2e8f0'
                  }
                }}
              >
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(value) => value}
                >
                  {currentReport}
                </ReactMarkdown>
              </Box>
            )}
            {activeView === 'table' && currentTable && (
              <Box sx={{ flex: 1, animation: 'fadeIn 0.3s ease-in-out' }}>
                <ChatTable data={currentTable} />
              </Box>
            )}
            {activeView === 'chart' && currentChart && (
              <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                animation: 'fadeIn 0.3s ease-in-out'
              }}>
                <img
                  src={`data:image/png;base64,${currentChart}`}
                  alt="Visualization"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}
            {activeView === 'dashboard' && currentDashboard && (
              <DashboardPanel data={currentDashboard} dashboardRef={dashboardRef} />
            )}
          </>
        )}
      </Box>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default DisplayPanel;
