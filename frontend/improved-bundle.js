// Improved bundle for Trade AI Platform with Super Admin support
const API_BASE_URL = 'http://localhost:5001/api';

// API Client
const apiClient = {
  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    
    return response.json();
  }
};

const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try to login with the backend API
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

        // Redirect based on user role
        if (response.data.user.role === 'super_admin') {
          alert('Super Admin login successful! Redirecting to Super Admin Dashboard...');
          // In a real app, this would be handled by React Router
          window.location.href = '/super-admin';
        } else {
          alert('Login successful! Redirecting to dashboard...');
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            onClick: togglePasswordVisibility
          }, showPassword ? '👁️‍🗨️' : '👁️‍🗨️')
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

const App = () => {
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
        React.createElement(LoginForm, { key: 'login-form' })
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
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(React.createElement(App), root);
  }
});