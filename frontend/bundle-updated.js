const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [companyDomain, setCompanyDomain] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          ...(companyDomain && { companyDomain })
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.data && userData.data.user) {
          // Store tokens in localStorage for API calls
          if (userData.data.tokens) {
            localStorage.setItem('accessToken', userData.data.tokens.accessToken);
            localStorage.setItem('refreshToken', userData.data.tokens.refreshToken);
          }
          alert('Login successful! User: ' + userData.data.user.name + ' (' + userData.data.user.role + ')');
        } else {
          setError('Login failed');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'login-container' }, [
    React.createElement('h2', null, 'Login to Trade AI Platform'),
    error && React.createElement('div', { className: 'error-message' }, error),
    React.createElement('form', { onSubmit: handleSubmit }, [
      React.createElement('div', { className: 'form-group' }, [
        React.createElement('label', { htmlFor: 'email' }, 'Email'),
        React.createElement('div', { className: 'input-with-icon' }, [
          React.createElement('span', { className: 'input-icon' }, '✉️'),
          React.createElement('input', {
            type: 'email',
            id: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            placeholder: 'Enter your email'
          })
        ])
      ]),
      React.createElement('div', { className: 'form-group' }, [
        React.createElement('label', { htmlFor: 'password' }, 'Password'),
        React.createElement('div', { className: 'input-with-icon' }, [
          React.createElement('span', { className: 'input-icon' }, '🔒'),
          React.createElement('input', {
            type: 'password',
            id: 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            placeholder: 'Enter your password'
          })
        ])
      ]),
      React.createElement('div', { className: 'form-group' }, [
        React.createElement('label', { htmlFor: 'companyDomain' }, 'Company Domain (optional - for company admins)'),
        React.createElement('input', {
          type: 'text',
          id: 'companyDomain',
          value: companyDomain,
          onChange: (e) => setCompanyDomain(e.target.value),
          placeholder: 'e.g., gonxt (leave empty for super admin)'
        })
      ]),
      React.createElement('div', { className: 'form-group' }, [
        React.createElement('button', {
          type: 'submit',
          disabled: loading,
          className: 'login-button'
        }, loading ? 'Logging in...' : 'Login')
      ]),
      React.createElement('div', { className: 'demo-credentials' }, [
        React.createElement('p', null, 'Demo Credentials:'),
        React.createElement('ul', null, [
          React.createElement('li', null, 'Super Admin: superadmin@tradeai.com / SuperAdmin123!'),
          React.createElement('li', null, 'GONXT Admin: admin@gonxt.co.za / GonxtAdmin123! (domain: gonxt)'),
          React.createElement('li', null, 'GONXT Manager: manager@gonxt.co.za / GonxtManager123! (domain: gonxt)')
        ])
      ])
    ])
  ]);
};

const App = () => {
  return React.createElement('div', { className: 'app-container' }, [
    React.createElement('div', { className: 'header' }, [
      React.createElement('img', {
        src: '/images/modern-logo-new.svg',
        alt: 'Trade AI Logo',
        className: 'logo'
      }),
      React.createElement('div', { className: 'header-text' }, [
        React.createElement('h1', null, 'Trade AI Platform'),
        React.createElement('p', null, 'Enterprise-grade FMCG Trade Spend Management with AI-Powered Analytics')
      ])
    ]),
    React.createElement('div', { className: 'main-content' }, [
      React.createElement('div', { className: 'login-section' }, [
        React.createElement(LoginForm)
      ]),
      React.createElement('div', { className: 'features-section' }, [
        React.createElement('h2', null, 'Key Features'),
        React.createElement('ul', { className: 'features-list' }, [
          React.createElement('li', null, 'AI-Powered Analytics: Machine learning models for sales forecasting, anomaly detection, and promotion optimization'),
          React.createElement('li', null, 'Budget Management: Multi-year budget planning with ML-powered forecasting'),
          React.createElement('li', null, 'Trade Spend Tracking: Complete lifecycle management for all trade spend types'),
          React.createElement('li', null, 'Promotion Management: End-to-end promotion planning with ROI analysis'),
          React.createElement('li', null, 'Real-time Dashboards: Executive, KAM, and Analytics dashboards with live updates'),
          React.createElement('li', null, 'SAP Integration: Seamless bi-directional sync with SAP systems'),
          React.createElement('li', null, 'Approval Workflows: Dynamic, role-based approval chains with SLA tracking'),
          React.createElement('li', null, 'Activity Calendar: Unified view of all trade activities with conflict detection')
        ])
      ])
    ])
  ]);
};

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(React.createElement(App), root);
});