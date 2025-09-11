// Working React App with Login
console.log('Working app starting...');

const { useState, useEffect } = React;

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// API Client
const apiClient = {
  post: async (url, data) => {
    try {
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
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get: async (url) => {
    try {
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
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Login Component
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', email);
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      console.log('Login response:', response);

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

  return React.createElement('div', { 
    style: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto'
    }
  }, [
    React.createElement('h2', { 
      key: 'title',
      style: { 
        marginTop: 0, 
        color: '#2563eb', 
        marginBottom: '1.5rem', 
        textAlign: 'center' 
      }
    }, 'Login to Trade AI Platform'),
    
    error && React.createElement('div', { 
      key: 'error',
      style: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1.5rem'
      }
    }, error),
    
    React.createElement('form', { 
      key: 'form', 
      onSubmit: handleSubmit 
    }, [
      React.createElement('div', { 
        key: 'email-group',
        style: { marginBottom: '1.5rem' }
      }, [
        React.createElement('label', { 
          key: 'email-label',
          style: { 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500' 
          }
        }, 'Email'),
        React.createElement('input', {
          key: 'email-input',
          type: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true,
          placeholder: 'Enter your email',
          style: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }
        })
      ]),
      
      React.createElement('div', { 
        key: 'password-group',
        style: { marginBottom: '1.5rem' }
      }, [
        React.createElement('label', { 
          key: 'password-label',
          style: { 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500' 
          }
        }, 'Password'),
        React.createElement('input', {
          key: 'password-input',
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
          placeholder: 'Enter your password',
          style: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }
        })
      ]),
      
      React.createElement('button', {
        key: 'submit-button',
        type: 'submit',
        disabled: loading,
        style: {
          width: '100%',
          padding: '0.75rem',
          backgroundColor: loading ? '#93c5fd' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer'
        }
      }, loading ? 'Logging in...' : 'Login'),
      
      React.createElement('div', { 
        key: 'demo-credentials',
        style: {
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#6b7280'
        }
      }, [
        React.createElement('p', { 
          key: 'demo-title',
          style: { marginBottom: '0.5rem', fontWeight: '500' }
        }, 'Demo Credentials:'),
        React.createElement('ul', { 
          key: 'demo-list',
          style: { marginTop: '0.5rem', paddingLeft: '1.5rem' }
        }, [
          React.createElement('li', { key: 'super-admin' }, 'Super Admin: superadmin@tradeai.com / SuperAdmin123!'),
          React.createElement('li', { key: 'gonxt-admin' }, 'GONXT Admin: admin@gonxt.co.za / GonxtAdmin123!'),
          React.createElement('li', { key: 'admin' }, 'Admin: admin@tradeai.com / password123')
        ])
      ])
    ])
  ]);
};

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    onLogout();
  };

  return React.createElement('div', { 
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }
  }, [
    React.createElement('div', { 
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }
    }, [
      React.createElement('h1', { 
        key: 'title',
        style: { color: '#2563eb', margin: 0, fontSize: '2rem' }
      }, user.role === 'super_admin' ? 'Super Admin Dashboard' : 'Trade AI Platform Dashboard'),
      React.createElement('div', { 
        key: 'user-info',
        style: { display: 'flex', alignItems: 'center', gap: '1rem' }
      }, [
        React.createElement('span', { 
          key: 'welcome',
          style: { color: '#666', fontWeight: '500' }
        }, `Welcome, ${user.firstName} ${user.lastName} (${user.role})`),
        React.createElement('button', { 
          key: 'logout',
          onClick: handleLogout,
          style: {
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }
        }, 'Logout')
      ])
    ]),
    React.createElement('div', { 
      key: 'content',
      style: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }, [
      React.createElement('p', { 
        key: 'message',
        style: { 
          color: '#666', 
          fontSize: '1.1rem', 
          textAlign: 'center', 
          margin: '2rem 0' 
        }
      }, user.role === 'super_admin' ? 
        'Super Admin functionality is working! Backend APIs are connected and ready.' : 
        'Dashboard functionality will be implemented here.')
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

  console.log('App rendering, authenticated:', isAuthenticated, 'user:', user);

  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    console.log('Logout');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return React.createElement('div', { 
      style: {
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        padding: '2rem'
      }
    }, [
      React.createElement('div', { 
        key: 'header',
        style: {
          textAlign: 'center',
          marginBottom: '2rem'
        }
      }, [
        React.createElement('h1', { 
          key: 'title',
          style: { 
            color: '#2563eb', 
            fontSize: '2.5rem', 
            margin: '0 0 0.5rem 0' 
          }
        }, 'Trade AI Platform'),
        React.createElement('p', { 
          key: 'subtitle',
          style: { 
            color: '#666', 
            fontSize: '1.2rem', 
            margin: 0 
          }
        }, 'Enterprise-grade FMCG Trade Spend Management with AI-Powered Analytics')
      ]),
      React.createElement(LoginForm, { key: 'login-form', onLogin: handleLogin })
    ]);
  }

  return React.createElement(Dashboard, { 
    user: user, 
    onLogout: handleLogout 
  });
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing working app...');
  const root = document.getElementById('root');
  if (root) {
    console.log('Root element found, rendering app...');
    ReactDOM.render(React.createElement(App), root);
  } else {
    console.error('Root element not found!');
  }
});

console.log('Working app script loaded successfully');