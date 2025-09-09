import React from 'react';
import { Box, useTheme, Divider } from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

// Mock data for development
const mockData = [
  { month: 'Jan', display: 25000, listing: 15000, promotion: 30000, discount: 40000, sampling: 10000, advertising: 30000 },
  { month: 'Feb', display: 30000, listing: 20000, promotion: 35000, discount: 45000, sampling: 12000, advertising: 35000 },
  { month: 'Mar', display: 28000, listing: 18000, promotion: 32000, discount: 42000, sampling: 11000, advertising: 32000 },
  { month: 'Apr', display: 32000, listing: 22000, promotion: 38000, discount: 48000, sampling: 14000, advertising: 38000 },
  { month: 'May', display: 35000, listing: 25000, promotion: 40000, discount: 50000, sampling: 15000, advertising: 40000 },
  { month: 'Jun', display: 38000, listing: 28000, promotion: 45000, discount: 55000, sampling: 18000, advertising: 45000 },
  { month: 'Jul', display: 36000, listing: 26000, promotion: 42000, discount: 52000, sampling: 16000, advertising: 42000 },
  { month: 'Aug', display: 40000, listing: 30000, promotion: 48000, discount: 58000, sampling: 20000, advertising: 48000 },
  { month: 'Sep', display: 42000, listing: 32000, promotion: 50000, discount: 60000, sampling: 22000, advertising: 50000 },
  { month: 'Oct', display: 45000, listing: 35000, promotion: 55000, discount: 65000, sampling: 25000, advertising: 55000 },
  { month: 'Nov', display: 48000, listing: 38000, promotion: 58000, discount: 68000, sampling: 28000, advertising: 58000 },
  { month: 'Dec', display: 50000, listing: 40000, promotion: 60000, discount: 70000, sampling: 30000, advertising: 60000 }
];

const TradeSpendTrendsChart = ({ height = 400 }) => {
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
      // Calculate total for the month
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      
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
          <Divider sx={{ my: 1 }} />
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            Total: {formatCurrency(total)}
          </p>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={mockData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="month" />
          <YAxis 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="display" 
            name="Display" 
            stackId="1"
            stroke={theme.palette.primary.main} 
            fill={theme.palette.primary.main} 
          />
          <Area 
            type="monotone" 
            dataKey="listing" 
            name="Listing" 
            stackId="1"
            stroke={theme.palette.secondary.main} 
            fill={theme.palette.secondary.main} 
          />
          <Area 
            type="monotone" 
            dataKey="promotion" 
            name="Promotion" 
            stackId="1"
            stroke={theme.palette.success.main} 
            fill={theme.palette.success.main} 
          />
          <Area 
            type="monotone" 
            dataKey="discount" 
            name="Discount" 
            stackId="1"
            stroke={theme.palette.warning.main} 
            fill={theme.palette.warning.main} 
          />
          <Area 
            type="monotone" 
            dataKey="sampling" 
            name="Sampling" 
            stackId="1"
            stroke={theme.palette.error.main} 
            fill={theme.palette.error.main} 
          />
          <Area 
            type="monotone" 
            dataKey="advertising" 
            name="Advertising" 
            stackId="1"
            stroke={theme.palette.info.main} 
            fill={theme.palette.info.main} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TradeSpendTrendsChart;