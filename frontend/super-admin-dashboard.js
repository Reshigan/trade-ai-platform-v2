// Comprehensive Super Admin Dashboard
console.log('Super Admin Dashboard loading...');

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
  },

  put: async (url, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
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

  delete: async (url) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
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

// Statistics Card Component
const StatCard = ({ title, value, icon, color = '#2563eb' }) => {
  return React.createElement('div', {
    style: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: `3px solid ${color}`,
      textAlign: 'center'
    }
  }, [
    React.createElement('div', {
      key: 'icon',
      style: {
        fontSize: '2rem',
        marginBottom: '0.5rem'
      }
    }, icon),
    React.createElement('div', {
      key: 'value',
      style: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: color,
        marginBottom: '0.5rem'
      }
    }, value),
    React.createElement('div', {
      key: 'title',
      style: {
        color: '#666',
        fontSize: '0.9rem',
        fontWeight: '500'
      }
    }, title)
  ]);
};

// Company Card Component
const CompanyCard = ({ company, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return React.createElement('div', {
    style: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }
  }, [
    React.createElement('div', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }
    }, [
      React.createElement('div', { key: 'info' }, [
        React.createElement('h3', {
          key: 'name',
          style: {
            margin: '0 0 0.5rem 0',
            color: '#2563eb',
            fontSize: '1.2rem'
          }
        }, company.name),
        React.createElement('p', {
          key: 'slug',
          style: {
            margin: '0 0 0.5rem 0',
            color: '#666',
            fontSize: '0.9rem'
          }
        }, `Slug: ${company.slug}`),
        React.createElement('p', {
          key: 'industry',
          style: {
            margin: '0',
            color: '#666',
            fontSize: '0.9rem'
          }
        }, `Industry: ${company.industry || 'Not specified'}`)
      ]),
      React.createElement('div', {
        key: 'actions',
        style: { display: 'flex', gap: '0.5rem' }
      }, [
        React.createElement('button', {
          key: 'edit',
          onClick: () => onEdit(company),
          style: {
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }
        }, 'Edit'),
        React.createElement('button', {
          key: 'delete',
          onClick: () => onDelete(company._id),
          style: {
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }
        }, 'Delete')
      ])
    ]),
    React.createElement('div', {
      key: 'details',
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        fontSize: '0.9rem',
        color: '#666'
      }
    }, [
      React.createElement('div', { key: 'status' }, [
        React.createElement('strong', { key: 'label' }, 'Status: '),
        React.createElement('span', {
          key: 'value',
          style: {
            color: company.isActive ? '#059669' : '#dc2626',
            fontWeight: '500'
          }
        }, company.isActive ? 'Active' : 'Inactive')
      ]),
      React.createElement('div', { key: 'users' }, [
        React.createElement('strong', { key: 'label' }, 'Users: '),
        React.createElement('span', { key: 'value' }, company.userCount || 0)
      ]),
      React.createElement('div', { key: 'created' }, [
        React.createElement('strong', { key: 'label' }, 'Created: '),
        React.createElement('span', { key: 'value' }, formatDate(company.createdAt))
      ]),
      React.createElement('div', { key: 'license' }, [
        React.createElement('strong', { key: 'label' }, 'License: '),
        React.createElement('span', {
          key: 'value',
          style: {
            color: new Date(company.license?.expiresAt) > new Date() ? '#059669' : '#dc2626'
          }
        }, company.license?.type || 'Basic')
      ])
    ])
  ]);
};

// Company Form Modal Component
const CompanyFormModal = ({ company, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: '',
    description: '',
    isActive: true,
    license: {
      type: 'basic',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        slug: company.slug || '',
        industry: company.industry || '',
        description: company.description || '',
        isActive: company.isActive !== undefined ? company.isActive : true,
        license: {
          type: company.license?.type || 'basic',
          expiresAt: company.license?.expiresAt ? 
            new Date(company.license.expiresAt).toISOString().split('T')[0] :
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        industry: '',
        description: '',
        isActive: true,
        license: {
          type: 'basic',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        license: {
          ...formData.license,
          expiresAt: new Date(formData.license.expiresAt).toISOString()
        }
      };

      if (company) {
        await apiClient.put(`/super-admin/companies/${company._id}`, submitData);
      } else {
        await apiClient.post('/super-admin/companies', submitData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }
  }, [
    React.createElement('div', {
      key: 'modal',
      style: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { marginTop: 0, color: '#2563eb' }
      }, company ? 'Edit Company' : 'Create Company'),
      
      error && React.createElement('div', {
        key: 'error',
        style: {
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }
      }, error),
      
      React.createElement('form', { key: 'form', onSubmit: handleSubmit }, [
        React.createElement('div', {
          key: 'name-group',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
          }, 'Company Name *'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            required: true,
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }
          })
        ]),
        
        React.createElement('div', {
          key: 'slug-group',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
          }, 'Slug *'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            value: formData.slug,
            onChange: (e) => setFormData({ ...formData, slug: e.target.value }),
            required: true,
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }
          })
        ]),
        
        React.createElement('div', {
          key: 'industry-group',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
          }, 'Industry'),
          React.createElement('select', {
            key: 'select',
            value: formData.industry,
            onChange: (e) => setFormData({ ...formData, industry: e.target.value }),
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }
          }, [
            React.createElement('option', { key: 'default', value: '' }, 'Select Industry'),
            React.createElement('option', { key: 'fmcg', value: 'FMCG' }, 'FMCG'),
            React.createElement('option', { key: 'retail', value: 'Retail' }, 'Retail'),
            React.createElement('option', { key: 'manufacturing', value: 'Manufacturing' }, 'Manufacturing'),
            React.createElement('option', { key: 'other', value: 'Other' }, 'Other')
          ])
        ]),
        
        React.createElement('div', {
          key: 'description-group',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
          }, 'Description'),
          React.createElement('textarea', {
            key: 'textarea',
            value: formData.description,
            onChange: (e) => setFormData({ ...formData, description: e.target.value }),
            rows: 3,
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }
          })
        ]),
        
        React.createElement('div', {
          key: 'license-group',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
          }, 'License Type'),
          React.createElement('select', {
            key: 'select',
            value: formData.license.type,
            onChange: (e) => setFormData({ 
              ...formData, 
              license: { ...formData.license, type: e.target.value }
            }),
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }
          }, [
            React.createElement('option', { key: 'basic', value: 'basic' }, 'Basic'),
            React.createElement('option', { key: 'premium', value: 'premium' }, 'Premium'),
            React.createElement('option', { key: 'enterprise', value: 'enterprise' }, 'Enterprise')
          ])
        ]),
        
        React.createElement('div', {
          key: 'expires-group',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
          }, 'License Expires'),
          React.createElement('input', {
            key: 'input',
            type: 'date',
            value: formData.license.expiresAt,
            onChange: (e) => setFormData({ 
              ...formData, 
              license: { ...formData.license, expiresAt: e.target.value }
            }),
            style: {
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }
          })
        ]),
        
        React.createElement('div', {
          key: 'active-group',
          style: { marginBottom: '2rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
          }, [
            React.createElement('input', {
              key: 'checkbox',
              type: 'checkbox',
              checked: formData.isActive,
              onChange: (e) => setFormData({ ...formData, isActive: e.target.checked })
            }),
            React.createElement('span', { key: 'text' }, 'Active')
          ])
        ]),
        
        React.createElement('div', {
          key: 'buttons',
          style: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' }
        }, [
          React.createElement('button', {
            key: 'cancel',
            type: 'button',
            onClick: onClose,
            style: {
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }
          }, 'Cancel'),
          React.createElement('button', {
            key: 'submit',
            type: 'submit',
            disabled: loading,
            style: {
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#93c5fd' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }
          }, loading ? 'Saving...' : 'Save')
        ])
      ])
    ])
  ]);
};

// Main Super Admin Dashboard Component
const SuperAdminDashboard = ({ user, onLogout }) => {
  const [statistics, setStatistics] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalBudgets: 0,
    activePromotions: 0
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load statistics
      const statsResponse = await apiClient.get('/super-admin/statistics');
      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }

      // Load companies
      const companiesResponse = await apiClient.get('/super-admin/companies');
      if (companiesResponse.success) {
        setCompanies(companiesResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
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

  const handleCreateCompany = () => {
    setEditingCompany(null);
    setShowCompanyForm(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      await apiClient.delete(`/super-admin/companies/${companyId}`);
      await loadDashboardData(); // Reload data
    } catch (error) {
      alert('Failed to delete company: ' + error.message);
    }
  };

  const handleCompanySaved = async () => {
    await loadDashboardData(); // Reload data
  };

  if (loading) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }
    }, [
      React.createElement('div', {
        key: 'loading',
        style: {
          fontSize: '1.2rem',
          color: '#666'
        }
      }, 'Loading dashboard...')
    ]);
  }

  return React.createElement('div', {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }
  }, [
    // Header
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
      }, 'Super Admin Dashboard'),
      React.createElement('div', {
        key: 'user-info',
        style: { display: 'flex', alignItems: 'center', gap: '1rem' }
      }, [
        React.createElement('span', {
          key: 'welcome',
          style: { color: '#666', fontWeight: '500' }
        }, `Welcome, ${user.firstName} ${user.lastName}`),
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

    // Error message
    error && React.createElement('div', {
      key: 'error',
      style: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }
    }, error),

    // Statistics Cards
    React.createElement('div', {
      key: 'statistics',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }
    }, [
      React.createElement(StatCard, {
        key: 'companies',
        title: 'Total Companies',
        value: statistics.totalCompanies,
        icon: '🏢',
        color: '#2563eb'
      }),
      React.createElement(StatCard, {
        key: 'users',
        title: 'Total Users',
        value: statistics.totalUsers,
        icon: '👥',
        color: '#059669'
      }),
      React.createElement(StatCard, {
        key: 'budgets',
        title: 'Active Budgets',
        value: statistics.totalBudgets,
        icon: '💰',
        color: '#dc2626'
      }),
      React.createElement(StatCard, {
        key: 'promotions',
        title: 'Active Promotions',
        value: statistics.activePromotions,
        icon: '🎯',
        color: '#7c3aed'
      })
    ]),

    // Companies Section
    React.createElement('div', {
      key: 'companies-section',
      style: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }, [
      React.createElement('div', {
        key: 'companies-header',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { color: '#2563eb', margin: 0 }
        }, 'Companies Management'),
        React.createElement('button', {
          key: 'create-btn',
          onClick: handleCreateCompany,
          style: {
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }
        }, '+ Create Company')
      ]),

      React.createElement('div', {
        key: 'companies-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }
      }, companies.map(company =>
        React.createElement(CompanyCard, {
          key: company._id,
          company: company,
          onEdit: handleEditCompany,
          onDelete: handleDeleteCompany
        })
      ))
    ]),

    // Company Form Modal
    React.createElement(CompanyFormModal, {
      key: 'company-form',
      company: editingCompany,
      isOpen: showCompanyForm,
      onClose: () => setShowCompanyForm(false),
      onSave: handleCompanySaved
    })
  ]);
};

// Login Component (same as before)
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
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));

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

  // Show Super Admin Dashboard for super admin users
  if (user.role === 'super_admin') {
    return React.createElement(SuperAdminDashboard, { 
      user: user, 
      onLogout: handleLogout 
    });
  }

  // Regular dashboard for other users
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
      }, 'Trade AI Platform Dashboard'),
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
      }, 'Regular user dashboard functionality will be implemented here.')
    ])
  ]);
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing Super Admin Dashboard...');
  const root = document.getElementById('root');
  if (root) {
    console.log('Root element found, rendering app...');
    ReactDOM.render(React.createElement(App), root);
  } else {
    console.error('Root element not found!');
  }
});

console.log('Super Admin Dashboard script loaded successfully');