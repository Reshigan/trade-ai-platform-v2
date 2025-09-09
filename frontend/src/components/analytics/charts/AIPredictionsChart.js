import React from 'react';
import { Box, useTheme } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

// Mock data for development
const mockData = [
  // Historical data
  { month: 'Jan', actual: 1250000, predicted: null, lower: null, upper: null, isPrediction: false },
  { month: 'Feb', actual: 1420000, predicted: null, lower: null, upper: null, isPrediction: false },
  { month: 'Mar', actual: 1380000, predicted: null, lower: null, upper: null, isPrediction: false },
  { month: 'Apr', actual: 1510000, predicted: null, lower: null, upper: null, isPrediction: false },
  { month: 'May', actual: 1650000, predicted: null, lower: null, upper: null, isPrediction: false },
  { month: 'Jun', actual: 1720000, predicted: null, lower: null, upper: null, isPrediction: false },
  // Current month
  { month: 'Jul', actual: 1680000, predicted: 1650000, lower: 1550000, upper: 1750000, isPrediction: false },
  // Predictions
  { month: 'Aug', actual: null, predicted: 1750000, lower: 1650000, upper: 1850000, isPrediction: true },
  { month: 'Sep', actual: null, predicted: 1820000, lower: 1700000, upper: 1940000, isPrediction: true },
  { month: 'Oct', actual: null, predicted: 1900000, lower: 1750000, upper: 2050000, isPrediction: true },
  { month: 'Nov', actual: null, predicted: 1950000, lower: 1800000, upper: 2100000, isPrediction: true },
  { month: 'Dec', actual: null, predicted: 2100000, lower: 1900000, upper: 2300000, isPrediction: true }
];

const AIPredictionsChart = ({ height = 400 }) => {
  const theme = useTheme();

  // Format currency for tooltip
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Find the index where predictions start
  const predictionStartIndex = mockData.findIndex(item => item.isPrediction);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
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
          {data.actual !== null && (
            <p style={{ margin: '5px 0', color: theme.palette.primary.main }}>
              Actual: {formatCurrency(data.actual)}
            </p>
          )}
          {data.predicted !== null && (
            <p style={{ margin: '5px 0', color: theme.palette.secondary.main }}>
              Predicted: {formatCurrency(data.predicted)}
            </p>
          )}
          {data.isPrediction && (
            <>
              <p style={{ margin: '5px 0', color: theme.palette.grey[600] }}>
                Lower Bound: {formatCurrency(data.lower)}
              </p>
              <p style={{ margin: '5px 0', color: theme.palette.grey[600] }}>
                Upper Bound: {formatCurrency(data.upper)}
              </p>
            </>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          
          {/* Prediction area */}
          <ReferenceArea 
            x1={mockData[predictionStartIndex - 1].month} 
            x2={mockData[mockData.length - 1].month} 
            fill={theme.palette.grey[100]} 
            fillOpacity={0.5} 
          />
          
          {/* Reference line for current month */}
          <ReferenceLine 
            x={mockData[predictionStartIndex - 1].month} 
            stroke={theme.palette.grey[500]} 
            strokeDasharray="3 3" 
            label={{ 
              value: 'Current', 
              position: 'insideTopRight',
              fill: theme.palette.grey[700],
              fontSize: 12
            }} 
          />
          
          {/* Actual sales line */}
          <Line 
            type="monotone" 
            dataKey="actual" 
            name="Actual Sales" 
            stroke={theme.palette.primary.main} 
            strokeWidth={2} 
            dot={{ r: 5 }} 
            activeDot={{ r: 8 }} 
          />
          
          {/* Predicted sales line */}
          <Line 
            type="monotone" 
            dataKey="predicted" 
            name="Predicted Sales" 
            stroke={theme.palette.secondary.main} 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={{ r: 5 }} 
            activeDot={{ r: 8 }} 
          />
          
          {/* Confidence interval area */}
          <Area 
            type="monotone" 
            dataKey="upper" 
            stroke="none" 
            fill={theme.palette.secondary.light} 
            fillOpacity={0.2} 
          />
          <Area 
            type="monotone" 
            dataKey="lower" 
            stroke="none" 
            fill={theme.palette.secondary.light} 
            fillOpacity={0.2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AIPredictionsChart;