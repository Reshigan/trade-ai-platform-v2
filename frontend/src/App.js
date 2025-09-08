import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#f9fafb',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <img src="/logo.svg" alt="Trade AI Logo" style={{ width: 200, marginBottom: 24 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Trade AI Platform
          </Typography>
          <Typography variant="h5" color="text.secondary" align="center" paragraph>
            Enterprise-grade FMCG Trade Spend Management with AI-Powered Analytics
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Welcome to Trade AI Platform
          </Typography>
          <Typography paragraph>
            This is a comprehensive trade spend management platform designed specifically for FMCG companies.
            It combines traditional trade spend management with cutting-edge AI/ML capabilities to optimize
            promotional effectiveness, forecast budgets, and maximize ROI.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Key Features
          </Typography>
          <ul>
            <li>AI-Powered Analytics: Machine learning models for sales forecasting, anomaly detection, and promotion optimization</li>
            <li>Budget Management: Multi-year budget planning with ML-powered forecasting</li>
            <li>Trade Spend Tracking: Complete lifecycle management for all trade spend types</li>
            <li>Promotion Management: End-to-end promotion planning with ROI analysis</li>
            <li>Real-time Dashboards: Executive, KAM, and Analytics dashboards with live updates</li>
            <li>SAP Integration: Seamless bi-directional sync with SAP systems</li>
            <li>Approval Workflows: Dynamic, role-based approval chains with SLA tracking</li>
            <li>Activity Calendar: Unified view of all trade activities with conflict detection</li>
          </ul>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;