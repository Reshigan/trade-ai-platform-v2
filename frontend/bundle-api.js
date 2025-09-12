// Simple bundle for Trade AI Platform with API integration - Version 2.0
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
      // Call the actual backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Create success message element
        const successDiv = document.createElement('div');
        successDiv.style.display = 'flex';
        successDiv.style.flexDirection = 'column';
        successDiv.style.justifyContent = 'center';
        successDiv.style.alignItems = 'center';
        successDiv.style.height = '100vh';
        successDiv.style.backgroundColor = '#f5f5f5';
        
        const contentDiv = document.createElement('div');
        contentDiv.style.width = '400px';
        contentDiv.style.padding = '40px';
        contentDiv.style.backgroundColor = 'white';
        contentDiv.style.borderRadius = '8px';
        contentDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        contentDiv.style.textAlign = 'center';
        
        const logo = document.createElement('img');
        logo.src = '/images/animated-logo-new.svg';
        logo.alt = 'Trade AI Logo';
        logo.style.width = '100px';
        logo.style.marginBottom = '16px';
        
        const heading = document.createElement('h1');
        heading.textContent = 'Login Successful - API Connected';
        heading.style.fontSize = '24px';
        heading.style.margin = '0 0 16px 0';
        heading.style.color = '#2563eb';
        
        const welcomeText = document.createElement('p');
        welcomeText.textContent = `Welcome to the Trade AI Platform, ${data.user.name || data.user.email}!`;
        welcomeText.style.color = '#666';
        welcomeText.style.marginBottom = '16px';
        
        const companyText = document.createElement('p');
        companyText.textContent = `Company: ${data.user.company?.name || 'N/A'}`;
        companyText.style.color = '#666';
        companyText.style.marginBottom = '16px';
        
        const roleText = document.createElement('p');
        roleText.textContent = `Role: ${data.user.role || 'N/A'}`;
        roleText.style.color = '#666';
        roleText.style.marginBottom = '24px';
        
        const infoText = document.createElement('p');
        infoText.textContent = 'Authentication successful! The full React dashboard would load here.';
        infoText.style.color = '#666';
        infoText.style.fontSize = '14px';
        
        const dashboardButton = document.createElement('button');
        dashboardButton.textContent = 'Continue to Dashboard';
        dashboardButton.style.marginTop = '20px';
        dashboardButton.style.padding = '12px 24px';
        dashboardButton.style.backgroundColor = '#2563eb';
        dashboardButton.style.color = 'white';
        dashboardButton.style.border = 'none';
        dashboardButton.style.borderRadius = '4px';
        dashboardButton.style.cursor = 'pointer';
        dashboardButton.style.fontSize = '16px';
        dashboardButton.onclick = () => {
          // In a real app, this would navigate to the dashboard
          alert('Dashboard navigation would happen here in the full React app');
        };
        
        contentDiv.appendChild(logo);
        contentDiv.appendChild(heading);
        contentDiv.appendChild(welcomeText);
        contentDiv.appendChild(companyText);
        contentDiv.appendChild(roleText);
        contentDiv.appendChild(infoText);
        contentDiv.appendChild(dashboardButton);
        successDiv.appendChild(contentDiv);
        
        // Clear the root and append the success message
        const root = document.getElementById('root');
        root.innerHTML = '';
        root.appendChild(successDiv);
      } else {
        // Show error from backend
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            type: showPassword ? 'text' : 'password', 
            id: 'password', 
            value: password, 
            onChange: (e) => setPassword(e.target.value),
            required: true,
            placeholder: 'Enter your password'
          }),
          React.createElement('button', {
            type: 'button',
            className: 'toggle-password',
            onClick: togglePasswordVisibility
          }, showPassword ? '👁️' : '👁️‍🗨️')
        ])
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
          React.createElement('li', null, 'Admin: admin@tradeai.com / password123'),
          React.createElement('li', null, 'Manager: manager@tradeai.com / password123'),
          React.createElement('li', null, 'KAM: kam@tradeai.com / password123')
        ])
      ])
    ])
  ]);
};

const App = () => {
  return React.createElement('div', { className: 'app-container' }, [
    React.createElement('div', { className: 'header' }, [
      React.createElement('img', { src: '/images/modern-logo-new.svg', alt: 'Trade AI Logo', className: 'logo' }),
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

// Render the App
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(React.createElement(App), root);
});