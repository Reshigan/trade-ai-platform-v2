import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CalendarToday,
  ShoppingCart,
  LocalOffer,
  Assessment,
  Warning,
  CheckCircle
} from '@mui/icons-material';

// Mock data
const budgetData = {
  total: 2500000,
  allocated: 1750000,
  remaining: 750000,
  percentUsed: 70
};

const recentPromotions = [
  { id: 1, name: 'Summer Sale', customer: 'Walmart', status: 'active', budget: 50000, startDate: '2025-06-01', endDate: '2025-06-30' },
  { id: 2, name: 'Back to School', customer: 'Target', status: 'planned', budget: 75000, startDate: '2025-08-01', endDate: '2025-08-31' },
  { id: 3, name: 'Holiday Special', customer: 'Costco', status: 'planned', budget: 100000, startDate: '2025-12-01', endDate: '2025-12-31' },
  { id: 4, name: 'Test Promotion', customer: 'Test Company', status: 'active', budget: 30000, startDate: '2025-09-01', endDate: '2025-09-30' }
];

const pendingApprovals = [
  { id: 1, type: 'Budget Increase', customer: 'Walmart', amount: 100000, requestedBy: 'John Smith', date: '2025-09-01' },
  { id: 2, type: 'New Promotion', customer: 'Target', amount: 50000, requestedBy: 'Jane Doe', date: '2025-09-03' }
];

const kpis = [
  { title: 'Total Budget', value: '$2.5M', icon: <AttachMoney color="primary" />, change: '+5%', trend: 'up' },
  { title: 'Active Promotions', value: '12', icon: <LocalOffer color="secondary" />, change: '+2', trend: 'up' },
  { title: 'Customers', value: '24', icon: <ShoppingCart color="success" />, change: '0', trend: 'neutral' },
  { title: 'Upcoming Events', value: '8', icon: <CalendarToday color="warning" />, change: '+3', trend: 'up' }
];

const Dashboard = ({ user }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name.split(' ')[0] || 'User'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's what's happening with your trade spend activities today.
      </Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'background.paper', mr: 2 }}>
                    {kpi.icon}
                  </Avatar>
                  <Typography variant="h6" component="div">
                    {kpi.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {kpi.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp fontSize="small" color="success" />
                  ) : kpi.trend === 'down' ? (
                    <TrendingDown fontSize="small" color="error" />
                  ) : (
                    <span style={{ width: 24 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={
                      kpi.trend === 'up' ? 'success.main' : 
                      kpi.trend === 'down' ? 'error.main' : 
                      'text.secondary'
                    }
                    sx={{ ml: 0.5 }}
                  >
                    {kpi.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={4}>
        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview (2025)
            </Typography>
            <Box sx={{ my: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  ${(budgetData.allocated / 1000000).toFixed(1)}M Used
                </Typography>
                <Typography variant="body2">
                  ${(budgetData.total / 1000000).toFixed(1)}M Total
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={budgetData.percentUsed} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Allocated
                  </Typography>
                  <Typography variant="h6">
                    ${(budgetData.allocated / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography variant="h6">
                    ${(budgetData.remaining / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    % Used
                  </Typography>
                  <Typography variant="h6">
                    {budgetData.percentUsed}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                Budget Forecast (AI Prediction)
              </Typography>
              <Chip 
                icon={<Assessment />} 
                label="View Details" 
                variant="outlined" 
                color="primary" 
                size="small"
                clickable
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Based on current spending patterns, you are projected to exceed your budget by 8% before year end.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Pending Approvals
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            {pendingApprovals.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {pendingApprovals.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                          <Warning />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {item.type} - {item.customer}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" color="text.secondary">
                              ${(item.amount).toLocaleString()} • Requested by {item.requestedBy} on {new Date(item.date).toLocaleDateString()}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="primary">
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error">
                          Reject
                        </Button>
                      </Box>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="subtitle1">
                  No pending approvals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All requests have been processed
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Promotions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Promotions
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            <Grid container spacing={2}>
              {recentPromotions.map((promotion) => (
                <Grid item xs={12} sm={6} md={3} key={promotion.id}>
                  <Card variant="outlined">
                    <CardHeader
                      title={promotion.name}
                      subheader={promotion.customer}
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      subheaderTypographyProps={{ variant: 'body2' }}
                      action={
                        <Chip 
                          label={promotion.status} 
                          size="small"
                          color={promotion.status === 'active' ? 'success' : 'default'}
                        />
                      }
                    />
                    <Divider />
                    <CardContent sx={{ pt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Budget: ${promotion.budget.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;