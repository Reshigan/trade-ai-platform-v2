import React from 'react';
import { Box, useTheme } from '@mui/material';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ZAxis,
  Label
} from 'recharts';

// Mock data for development
const mockData = [
  { name: 'Premium Cereal', sales: 2100000, roi: 6.2, volume: 420000, category: 'Breakfast' },
  { name: 'Organic Granola', sales: 1450000, roi: 5.8, volume: 290000, category: 'Breakfast' },
  { name: 'Chocolate Cookies', sales: 1850000, roi: 7.4, volume: 370000, category: 'Snacks' },
  { name: 'Fruit Juice', sales: 1650000, roi: 5.5, volume: 330000, category: 'Beverages' },
  { name: 'Potato Chips', sales: 1950000, roi: 6.5, volume: 390000, category: 'Snacks' },
  { name: 'Yogurt', sales: 1250000, roi: 4.2, volume: 250000, category: 'Dairy' },
  { name: 'Ice Cream', sales: 1350000, roi: 5.4, volume: 270000, category: 'Frozen' },
  { name: 'Canned Soup', sales: 950000, roi: 3.8, volume: 190000, category: 'Canned Goods' },
  { name: 'Pasta', sales: 850000, roi: 4.3, volume: 170000, category: 'Dry Goods' },
  { name: 'Coffee', sales: 1550000, roi: 6.2, volume: 310000, category: 'Beverages' }
];

// Group data by category
const categories = [...new Set(mockData.map(item => item.category))];
const dataByCategory = categories.map(category => ({
  name: category,
  data: mockData.filter(item => item.category === category)
}));

const ProductPerformanceChart = ({ height = 400 }) => {
  const theme = useTheme();

  // Colors for different categories
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300'
  ];

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
  const CustomTooltip = ({ active, payload }) => {
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
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: '5px 0' }}>
            Category: {data.category}
          </p>
          <p style={{ margin: '5px 0' }}>
            Sales: {formatCurrency(data.sales)}
          </p>
          <p style={{ margin: '5px 0' }}>
            ROI: {data.roi}x
          </p>
          <p style={{ margin: '5px 0' }}>
            Volume: {data.volume.toLocaleString()} units
          </p>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            type="number" 
            dataKey="roi" 
            name="ROI" 
            domain={[3, 8]}
          >
            <Label
              value="ROI (x)"
              position="bottom"
              offset={0}
              style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
            />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="sales" 
            name="Sales" 
            tickFormatter={(value) => formatCurrency(value)}
            width={80}
          >
            <Label
              value="Sales"
              position="left"
              angle={-90}
              offset={-10}
              style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
            />
          </YAxis>
          <ZAxis 
            type="number" 
            dataKey="volume" 
            range={[50, 500]} 
            name="Volume" 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {dataByCategory.map((category, index) => (
            <Scatter 
              key={category.name}
              name={category.name} 
              data={category.data} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ProductPerformanceChart;