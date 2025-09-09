import React from 'react';
import { Box, useTheme } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';

// Mock data for development
const mockData = [
  { month: 'Jan', sales: 1250000, target: 1200000, lastYear: 1100000 },
  { month: 'Feb', sales: 1420000, target: 1300000, lastYear: 1150000 },
  { month: 'Mar', sales: 1380000, target: 1400000, lastYear: 1250000 },
  { month: 'Apr', sales: 1510000, target: 1450000, lastYear: 1300000 },
  { month: 'May', sales: 1650000, target: 1500000, lastYear: 1400000 },
  { month: 'Jun', sales: 1720000, target: 1550000, lastYear: 1450000 },
  { month: 'Jul', sales: 1680000, target: 1600000, lastYear: 1500000 },
  { month: 'Aug', sales: 1750000, target: 1650000, lastYear: 1550000 },
  { month: 'Sep', sales: 1820000, target: 1700000, lastYear: 1600000 },
  { month: 'Oct', sales: 1900000, target: 1750000, lastYear: 1650000 },
  { month: 'Nov', sales: 1950000, target: 1800000, lastYear: 1700000 },
  { month: 'Dec', sales: 2100000, target: 1900000, lastYear: 1800000 }
];

const SalesPerformanceChart = ({ height = 400 }) => {
  const theme = useTheme();

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '5px 0', color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={mockData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="month" />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="sales" 
            name="Sales" 
            fill={theme.palette.primary.main} 
            barSize={20} 
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            name="Target" 
            stroke={theme.palette.error.main} 
            strokeWidth={2} 
            dot={{ r: 4 }} 
          />
          <Line 
            type="monotone" 
            dataKey="lastYear" 
            name="Last Year" 
            stroke={theme.palette.grey[500]} 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={{ r: 4 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SalesPerformanceChart;