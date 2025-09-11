import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Grid,
  Divider,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import authService from '../services/api/authService';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = { 
        email, 
        password,
        ...(companyDomain && { companyDomain })
      };
      
      const userData = await authService.login(credentials);
      onLogin(userData.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container spacing={2} sx={{ height: '80vh' }}>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <img src="src/assets/new_logo.svg" alt="Trade AI Logo" style={{ width: 120, marginBottom: 16 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Trade AI Platform
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center">
              Enterprise-grade FMCG Trade Spend Management with AI-Powered Analytics
            </Typography>
          </Box>
          
          <Card elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Login to your account
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="companyDomain"
                  label="Company Domain (optional - for company admins)"
                  name="companyDomain"
                  autoComplete="organization"
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  helperText="Leave empty for super admin login"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Demo Credentials
                </Typography>
              </Divider>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Super Admin:</strong> superadmin@tradeai.com / SuperAdmin123!
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>GONXT Admin:</strong> admin@gonxt.co.za / GonxtAdmin123! (domain: gonxt)
                </Typography>
                <Typography variant="body2">
                  <strong>GONXT Manager:</strong> manager@gonxt.co.za / GonxtManager123! (domain: gonxt)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'white',
              height: '100%',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome to Trade AI Platform
            </Typography>
            <Typography variant="body1" paragraph>
              The most comprehensive trade spend management solution for FMCG companies, powered by artificial intelligence.
            </Typography>
            
            <Box sx={{ my: 4 }}>
              <Typography variant="h6" gutterBottom>
                Key Features
              </Typography>
              <ul>
                <li>AI-Powered Analytics and Forecasting</li>
                <li>Budget Management and Planning</li>
                <li>Trade Spend Tracking and Optimization</li>
                <li>Promotion ROI Analysis</li>
                <li>Real-time Dashboards and Reporting</li>
                <li>SAP Integration</li>
              </ul>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2">
                Need help? <Link href="#" color="inherit" underline="always">Contact Support</Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;