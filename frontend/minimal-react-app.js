// Minimal React App with Super Admin Support
const { useState, useEffect } = React;

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// API Client
const apiClient = {
  post: async (url, data) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    
    return response.json();
  },

  get: async (url) => {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    
    return response.json();
  }
};

// Login Component
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      if (response.success && response.data) {
        // Store tokens and user data
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Call the onLogin callback
        onLogin(response.data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'login-container' }, [
    React.createElement('h2', { key: 'title' }, 'Login to Trade AI Platform'),
    error && React.createElement('div', { 
      key: 'error', 
      className: 'error-message' 
    }, error),
    React.createElement('form', { 
      key: 'form', 
      onSubmit: handleSubmit 
    }, [
      React.createElement('div', { 
        key: 'email-group', 
        className: 'form-group' 
      }, [
        React.createElement('label', { 
          key: 'email-label', 
          htmlFor: 'email' 
        }, 'Email'),
        React.createElement('div', {
          key: 'email-input-container',
          className: 'input-with-icon'
        }, [
          React.createElement('span', {
            key: 'email-icon',
            className: 'input-icon'
          }, '✉️'),
          React.createElement('input', {
            key: 'email-input',
            type: 'email',
            id: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            placeholder: 'Enter your email'
          })
        ])
      ]),
      React.createElement('div', { 
        key: 'password-group', 
        className: 'form-group' 
      }, [
        React.createElement('label', { 
          key: 'password-label', 
          htmlFor: 'password' 
        }, 'Password'),
        React.createElement('div', {
          key: 'password-input-container',
          className: 'input-with-icon'
        }, [
          React.createElement('span', {
            key: 'password-icon',
            className: 'input-icon'
          }, '🔒'),
          React.createElement('input', {
            key: 'password-input',
            type: showPassword ? 'text' : 'password',
            id: 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            placeholder: 'Enter your password'
          }),
          React.createElement('button', {
            key: 'toggle-password',
            type: 'button',
            className: 'toggle-password',
            onClick: () => setShowPassword(!showPassword)
          }, showPassword ? '🙈' : '👁️')
        ])
      ]),
      React.createElement('div', { 
        key: 'submit-group', 
        className: 'form-group' 
      }, [
        React.createElement('button', {
          key: 'submit-button',
          type: 'submit',
          disabled: loading,
          className: 'login-button'
        }, loading ? 'Logging in...' : 'Login')
      ]),
      React.createElement('div', { 
        key: 'demo-credentials', 
        className: 'demo-credentials' 
      }, [
        React.createElement('p', { key: 'demo-title' }, 'Demo Credentials:'),
        React.createElement('ul', { key: 'demo-list' }, [
          React.createElement('li', { key: 'super-admin' }, 'Super Admin: superadmin@tradeai.com / SuperAdmin123!'),
          React.createElement('li', { key: 'gonxt-admin' }, 'GONXT Admin: admin@gonxt.co.za / GonxtAdmin123!'),
          React.createElement('li', { key: 'gonxt-manager' }, 'GONXT Manager: manager@gonxt.co.za / GonxtManager123!'),
          React.createElement('li', { key: 'admin' }, 'Admin: admin@tradeai.com / password123'),
          React.createElement('li', { key: 'manager' }, 'Manager: manager@tradeai.com / password123'),
          React.createElement('li', { key: 'kam' }, 'KAM: kam@tradeai.com / password123')
        ])
      ])
    ])
  ]);
};

// Super Admin Dashboard Component
const SuperAdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await apiClient.get('/super-admin/statistics');
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Load companies
      const companiesResponse = await apiClient.get('/super-admin/companies');
      if (companiesResponse.success) {
        setCompanies(companiesResponse.data.companies || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) {
    return React.createElement('div', { className: 'dashboard-container' }, [
      React.createElement('div', { key: 'loading', className: 'loading' }, 'Loading dashboard...')
    ]);
  }

  return React.createElement('div', { className: 'dashboard-container' }, [
    // Header
    React.createElement('div', { key: 'header', className: 'dashboard-header' }, [
      React.createElement('h1', { key: 'title' }, 'Super Admin Dashboard'),
      React.createElement('div', { key: 'user-info', className: 'user-info' }, [
        React.createElement('span', { key: 'welcome' }, `Welcome, ${user.firstName} ${user.lastName}`),
        React.createElement('button', { 
          key: 'logout', 
          className: 'logout-button',
          onClick: handleLogout 
        }, 'Logout')
      ])
    ]),

    // Error message
    error && React.createElement('div', { 
      key: 'error', 
      className: 'error-message' 
    }, error),

    // Statistics
    stats && React.createElement('div', { key: 'stats', className: 'stats-section' }, [
      React.createElement('h2', { key: 'stats-title' }, 'Platform Statistics'),
      React.createElement('div', { key: 'stats-grid', className: 'stats-grid' }, [
        React.createElement('div', { key: 'companies-stat', className: 'stat-card' }, [
          React.createElement('h3', { key: 'title' }, 'Companies'),
          React.createElement('p', { key: 'value' }, stats.totalCompanies || 0)
        ]),
        React.createElement('div', { key: 'users-stat', className: 'stat-card' }, [
          React.createElement('h3', { key: 'title' }, 'Users'),
          React.createElement('p', { key: 'value' }, stats.totalUsers || 0)
        ]),
        React.createElement('div', { key: 'budgets-stat', className: 'stat-card' }, [
          React.createElement('h3', { key: 'title' }, 'Budgets'),
          React.createElement('p', { key: 'value' }, stats.totalBudgets || 0)
        ])
      ])
    ]),

    // Companies List
    React.createElement('div', { key: 'companies', className: 'companies-section' }, [
      React.createElement('h2', { key: 'companies-title' }, 'Companies'),
      React.createElement('div', { key: 'companies-list', className: 'companies-list' }, 
        companies.map((company, index) => 
          React.createElement('div', { 
            key: company._id || index, 
            className: 'company-card' 
          }, [
            React.createElement('h3', { key: 'name' }, company.name),
            React.createElement('p', { key: 'domain' }, `Domain: ${company.domain}`),
            React.createElement('p', { key: 'status' }, `Status: ${company.isActive ? 'Active' : 'Inactive'}`),
            React.createElement('p', { key: 'users' }, `Users: ${company.userCount || 0}`)
          ])
        )
      )
    ])
  ]);
};

// Regular Dashboard Component (for non-super-admin users)
const RegularDashboard = ({ user, onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    onLogout();
  };

  return React.createElement('div', { className: 'dashboard-container' }, [
    React.createElement('div', { key: 'header', className: 'dashboard-header' }, [
      React.createElement('h1', { key: 'title' }, 'Trade AI Platform Dashboard'),
      React.createElement('div', { key: 'user-info', className: 'user-info' }, [
        React.createElement('span', { key: 'welcome' }, `Welcome, ${user.firstName} ${user.lastName} (${user.role})`),
        React.createElement('button', { 
          key: 'logout', 
          className: 'logout-button',
          onClick: handleLogout 
        }, 'Logout')
      ])
    ]),
    React.createElement('div', { key: 'content', className: 'dashboard-content' }, [
      React.createElement('p', { key: 'message' }, 'Regular dashboard functionality will be implemented here.')
    ])
  ]);
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return React.createElement('div', { className: 'app-container' }, [
      React.createElement('div', { 
        key: 'header', 
        className: 'header' 
      }, [
        React.createElement('img', {
          key: 'logo',
          src: '/images/modern-logo-new.svg',
          alt: 'Trade AI Logo',
          className: 'logo'
        }),
        React.createElement('div', { 
          key: 'header-text', 
          className: 'header-text' 
        }, [
          React.createElement('h1', { key: 'title' }, 'Trade AI Platform'),
          React.createElement('p', { key: 'subtitle' }, 'Enterprise-grade FMCG Trade Spend Management with AI-Powered Analytics')
        ])
      ]),
      React.createElement('div', { 
        key: 'main-content', 
        className: 'main-content' 
      }, [
        React.createElement('div', { 
          key: 'login-section', 
          className: 'login-section' 
        }, [
          React.createElement(LoginForm, { key: 'login-form', onLogin: handleLogin })
        ]),
        React.createElement('div', { 
          key: 'features-section', 
          className: 'features-section' 
        }, [
          React.createElement('h2', { key: 'features-title' }, 'Key Features'),
          React.createElement('ul', { 
            key: 'features-list', 
            className: 'features-list' 
          }, [
            React.createElement('li', { key: 'feature-1' }, 'AI-Powered Analytics: Machine learning models for sales forecasting, anomaly detection, and promotion optimization'),
            React.createElement('li', { key: 'feature-2' }, 'Budget Management: Multi-year budget planning with ML-powered forecasting'),
            React.createElement('li', { key: 'feature-3' }, 'Trade Spend Tracking: Complete lifecycle management for all trade spend types'),
            React.createElement('li', { key: 'feature-4' }, 'Promotion Management: End-to-end promotion planning with ROI analysis'),
            React.createElement('li', { key: 'feature-5' }, 'Real-time Dashboards: Executive, KAM, and Analytics dashboards with live updates'),
            React.createElement('li', { key: 'feature-6' }, 'SAP Integration: Seamless bi-directional sync with SAP systems'),
            React.createElement('li', { key: 'feature-7' }, 'Approval Workflows: Dynamic, role-based approval chains with SLA tracking'),
            React.createElement('li', { key: 'feature-8' }, 'Activity Calendar: Unified view of all trade activities with conflict detection')
          ])
        ])
      ])
    ]);
  }

  // Show appropriate dashboard based on user role
  if (user && user.role === 'super_admin') {
    return React.createElement(SuperAdminDashboard, { 
      user: user, 
      onLogout: handleLogout 
    });
  } else {
    return React.createElement(RegularDashboard, { 
      user: user, 
      onLogout: handleLogout 
    });
  }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(React.createElement(App), root);
  }
});