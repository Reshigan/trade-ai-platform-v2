// Comprehensive Super Admin Dashboard with Full Company Form
console.log('Comprehensive dashboard loading...');

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
          key: 'domain',
          style: {
            margin: '0 0 0.5rem 0',
            color: '#666',
            fontSize: '0.9rem'
          }
        }, `Domain: ${company.domain || company.slug}`),
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
      React.createElement('div', { key: 'subscription' }, [
        React.createElement('strong', { key: 'label' }, 'Plan: '),
        React.createElement('span', {
          key: 'value',
          style: {
            color: '#059669'
          }
        }, company.subscription?.plan || 'Basic')
      ])
    ])
  ]);
};

// Comprehensive Company Form Modal Component
const CompanyFormModal = ({ company, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    country: '',
    contactInfo: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        country: ''
      }
    },
    subscription: {
      plan: 'professional',
      maxUsers: 50,
      maxBudgets: 10,
      features: ['basic_analytics', 'budget_management', 'reporting']
    },
    adminUser: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        domain: company.domain || company.slug || '',
        industry: company.industry || '',
        country: company.country || '',
        contactInfo: {
          email: company.contactInfo?.email || '',
          phone: company.contactInfo?.phone || '',
          address: {
            street: company.contactInfo?.address?.street || '',
            city: company.contactInfo?.address?.city || '',
            country: company.contactInfo?.address?.country || ''
          }
        },
        subscription: {
          plan: company.subscription?.plan || 'professional',
          maxUsers: company.subscription?.maxUsers || 50,
          maxBudgets: company.subscription?.maxBudgets || 10,
          features: company.subscription?.features || ['basic_analytics', 'budget_management', 'reporting']
        },
        adminUser: {
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        }
      });
    } else {
      setFormData({
        name: '',
        domain: '',
        industry: '',
        country: '',
        contactInfo: {
          email: '',
          phone: '',
          address: {
            street: '',
            city: '',
            country: ''
          }
        },
        subscription: {
          plan: 'professional',
          maxUsers: 50,
          maxBudgets: 10,
          features: ['basic_analytics', 'budget_management', 'reporting']
        },
        adminUser: {
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        }
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (company) {
        // For updates, we don't need admin user info
        const updateData = {
          name: formData.name,
          domain: formData.domain,
          industry: formData.industry,
          country: formData.country,
          contactInfo: formData.contactInfo,
          subscription: formData.subscription
        };
        await apiClient.put(`/super-admin/companies/${company._id}`, updateData);
      } else {
        // For creation, we need all fields
        await apiClient.post('/super-admin/companies', formData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateNestedField = (path, value) => {
    const keys = path.split('.');
    const newFormData = { ...formData };
    let current = newFormData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFormData(newFormData);
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
        maxWidth: '600px',
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
        // Company Information Section
        React.createElement('div', {
          key: 'company-section',
          style: { marginBottom: '2rem' }
        }, [
          React.createElement('h3', {
            key: 'section-title',
            style: { color: '#374151', marginBottom: '1rem' }
          }, 'Company Information'),
          
          React.createElement('div', {
            key: 'company-fields',
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
          }, [
            React.createElement('div', {
              key: 'name-group'
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
              key: 'domain-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Domain *'),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                value: formData.domain,
                onChange: (e) => setFormData({ ...formData, domain: e.target.value }),
                required: true,
                placeholder: 'company-domain',
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
              key: 'industry-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Industry *'),
              React.createElement('select', {
                key: 'select',
                value: formData.industry,
                onChange: (e) => setFormData({ ...formData, industry: e.target.value }),
                required: true,
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
              key: 'country-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Country *'),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                value: formData.country,
                onChange: (e) => setFormData({ ...formData, country: e.target.value }),
                required: true,
                placeholder: 'South Africa',
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }
              })
            ])
          ])
        ]),
        
        // Contact Information Section
        React.createElement('div', {
          key: 'contact-section',
          style: { marginBottom: '2rem' }
        }, [
          React.createElement('h3', {
            key: 'section-title',
            style: { color: '#374151', marginBottom: '1rem' }
          }, 'Contact Information'),
          
          React.createElement('div', {
            key: 'contact-fields',
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
          }, [
            React.createElement('div', {
              key: 'email-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Contact Email *'),
              React.createElement('input', {
                key: 'input',
                type: 'email',
                value: formData.contactInfo.email,
                onChange: (e) => updateNestedField('contactInfo.email', e.target.value),
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
              key: 'phone-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Phone'),
              React.createElement('input', {
                key: 'input',
                type: 'tel',
                value: formData.contactInfo.phone,
                onChange: (e) => updateNestedField('contactInfo.phone', e.target.value),
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }
              })
            ])
          ])
        ]),
        
        // Admin User Section (only for new companies)
        !company && React.createElement('div', {
          key: 'admin-section',
          style: { marginBottom: '2rem' }
        }, [
          React.createElement('h3', {
            key: 'section-title',
            style: { color: '#374151', marginBottom: '1rem' }
          }, 'Admin User'),
          
          React.createElement('div', {
            key: 'admin-fields',
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
          }, [
            React.createElement('div', {
              key: 'firstName-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'First Name *'),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                value: formData.adminUser.firstName,
                onChange: (e) => updateNestedField('adminUser.firstName', e.target.value),
                required: !company,
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
              key: 'lastName-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Last Name *'),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                value: formData.adminUser.lastName,
                onChange: (e) => updateNestedField('adminUser.lastName', e.target.value),
                required: !company,
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
              key: 'adminEmail-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Admin Email *'),
              React.createElement('input', {
                key: 'input',
                type: 'email',
                value: formData.adminUser.email,
                onChange: (e) => updateNestedField('adminUser.email', e.target.value),
                required: !company,
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
              key: 'password-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Password *'),
              React.createElement('input', {
                key: 'input',
                type: 'password',
                value: formData.adminUser.password,
                onChange: (e) => updateNestedField('adminUser.password', e.target.value),
                required: !company,
                placeholder: 'Min 8 chars, uppercase, lowercase, number, special',
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }
              })
            ])
          ])
        ]),
        
        // Subscription Section
        React.createElement('div', {
          key: 'subscription-section',
          style: { marginBottom: '2rem' }
        }, [
          React.createElement('h3', {
            key: 'section-title',
            style: { color: '#374151', marginBottom: '1rem' }
          }, 'Subscription Plan'),
          
          React.createElement('div', {
            key: 'subscription-fields',
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }
          }, [
            React.createElement('div', {
              key: 'plan-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Plan'),
              React.createElement('select', {
                key: 'select',
                value: formData.subscription.plan,
                onChange: (e) => updateNestedField('subscription.plan', e.target.value),
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }
              }, [
                React.createElement('option', { key: 'starter', value: 'starter' }, 'Starter'),
                React.createElement('option', { key: 'professional', value: 'professional' }, 'Professional'),
                React.createElement('option', { key: 'enterprise', value: 'enterprise' }, 'Enterprise'),
                React.createElement('option', { key: 'custom', value: 'custom' }, 'Custom')
              ])
            ]),
            
            React.createElement('div', {
              key: 'maxUsers-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Max Users'),
              React.createElement('input', {
                key: 'input',
                type: 'number',
                value: formData.subscription.maxUsers,
                onChange: (e) => updateNestedField('subscription.maxUsers', parseInt(e.target.value)),
                min: 1,
                max: 1000,
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
              key: 'maxBudgets-group'
            }, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }
              }, 'Max Budgets'),
              React.createElement('input', {
                key: 'input',
                type: 'number',
                value: formData.subscription.maxBudgets,
                onChange: (e) => updateNestedField('subscription.maxBudgets', parseInt(e.target.value)),
                min: 1,
                max: 100,
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }
              })
            ])
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
  const [statistics, setStatistics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

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
      setError('Failed to load dashboard data: ' + error.message);
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
    statistics && React.createElement('div', {
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
        value: statistics.overview?.totalCompanies || 0,
        icon: '🏢',
        color: '#2563eb'
      }),
      React.createElement(StatCard, {
        key: 'users',
        title: 'Total Users',
        value: statistics.overview?.totalUsers || 0,
        icon: '👥',
        color: '#059669'
      }),
      React.createElement(StatCard, {
        key: 'budgets',
        title: 'Active Budgets',
        value: statistics.overview?.totalBudgets || 0,
        icon: '💰',
        color: '#dc2626'
      }),
      React.createElement(StatCard, {
        key: 'active',
        title: 'Active Companies',
        value: statistics.overview?.activeCompanies || 0,
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
          React.createElement('li', { key: 'super-admin' }, 'Super Admin: superadmin@tradeai.com / SuperAdmin123!')
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

  return React.createElement(SuperAdminDashboard, { 
    user: user, 
    onLogout: handleLogout 
  });
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing comprehensive dashboard...');
  const root = document.getElementById('root');
  if (root) {
    console.log('Root element found, rendering app...');
    ReactDOM.render(React.createElement(App), root);
  } else {
    console.error('Root element not found!');
  }
});

console.log('Comprehensive dashboard script loaded successfully');