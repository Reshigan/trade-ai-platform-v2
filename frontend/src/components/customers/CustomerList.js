import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { PageHeader, DataTable, StatusChip } from '../common';
import { customerService } from '../../services/api';
import CustomerForm from './CustomerForm';

// Mock data for development - South African retail channels
const mockCustomers = [
  {
    id: '1',
    name: 'Shoprite Holdings',
    code: 'SHP',
    type: 'retailer',
    status: 'active',
    contact: {
      name: 'Pieter Engelbrecht',
      email: 'p.engelbrecht@shoprite.co.za',
      phone: '+27-21-980-4000'
    },
    address: {
      street: 'Cnr William Dabs and Old Paarl Roads',
      city: 'Cape Town',
      state: 'Western Cape',
      zip: '7560',
      country: 'South Africa'
    },
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2025-03-10')
  },
  {
    id: '2',
    name: 'Pick n Pay',
    code: 'PNP',
    type: 'retailer',
    status: 'active',
    contact: {
      name: 'Richard Brasher',
      email: 'r.brasher@pnp.co.za',
      phone: '+27-21-658-1000'
    },
    address: {
      street: '101 Rosmead Avenue',
      city: 'Cape Town',
      state: 'Western Cape',
      zip: '7708',
      country: 'South Africa'
    },
    created_at: new Date('2024-02-20'),
    updated_at: new Date('2025-04-15')
  },
  {
    id: '3',
    name: 'SPAR Group',
    code: 'SPAR',
    type: 'wholesaler',
    status: 'active',
    contact: {
      name: 'Brett Botten',
      email: 'b.botten@spar.co.za',
      phone: '+27-31-719-3000'
    },
    address: {
      street: '22 Chancery Lane',
      city: 'Durban',
      state: 'KwaZulu-Natal',
      zip: '4001',
      country: 'South Africa'
    },
    created_at: new Date('2024-03-05'),
    updated_at: new Date('2025-05-20')
  },
  {
    id: '4',
    name: 'Woolworths Holdings',
    code: 'WHL',
    type: 'retailer',
    status: 'active',
    contact: {
      name: 'Roy Bagattini',
      email: 'r.bagattini@woolworths.co.za',
      phone: '+27-21-407-9111'
    },
    address: {
      street: '93 Longmarket Street',
      city: 'Cape Town',
      state: 'Western Cape',
      zip: '8001',
      country: 'South Africa'
    },
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-08-01')
  },
  {
    id: '5',
    name: 'Massmart (Game, Makro)',
    code: 'MSM',
    type: 'retailer',
    status: 'active',
    contact: {
      name: 'Mitchell Slape',
      email: 'm.slape@massmart.co.za',
      phone: '+27-11-517-0000'
    },
    address: {
      street: '16 Peltier Drive',
      city: 'Johannesburg',
      state: 'Gauteng',
      zip: '2191',
      country: 'South Africa'
    },
    created_at: new Date('2024-04-10'),
    updated_at: new Date('2025-06-05')
  },
  {
    id: '6',
    name: 'Boxer Superstores',
    code: 'BOX',
    type: 'retailer',
    status: 'active',
    contact: {
      name: 'Marek Masojada',
      email: 'm.masojada@boxer.co.za',
      phone: '+27-31-275-9600'
    },
    address: {
      street: '21 The Boulevard',
      city: 'Durban',
      state: 'KwaZulu-Natal',
      zip: '4051',
      country: 'South Africa'
    },
    created_at: new Date('2024-05-12'),
    updated_at: new Date('2025-07-18')
  },
  {
    id: '7',
    name: 'Diplomat South Africa',
    code: 'DSA',
    type: 'distributor',
    status: 'active',
    contact: {
      name: 'Sarah Nkosi',
      email: 's.nkosi@diplomat.co.za',
      phone: '+27-11-234-5678'
    },
    address: {
      street: '45 Commerce Crescent',
      city: 'Johannesburg',
      state: 'Gauteng',
      zip: '2157',
      country: 'South Africa'
    },
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2025-08-15')
  }
];

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call the API
      // const response = await customerService.getAll();
      // setCustomers(response.data);
      
      // Using mock data for development
      setTimeout(() => {
        setCustomers(mockCustomers);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch customers. Please try again.');
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Handle row click
  const handleRowClick = (customer) => {
    navigate(`/customers/${customer.id}`);
  };

  // Handle create customer
  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setOpenForm(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedCustomer(null);
  };

  // Handle form submit
  const handleFormSubmit = async (customerData) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        // await customerService.update(selectedCustomer.id, customerData);
      } else {
        // Create new customer
        // await customerService.create(customerData);
      }
      
      // Refresh customers
      fetchCustomers();
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving customer:', err);
      // Handle error
    }
  };

  // Apply filters to customers
  const filteredCustomers = customers.filter((customer) => {
    // Apply type filter
    if (filters.type && customer.type !== filters.type) {
      return false;
    }
    
    // Apply status filter
    if (filters.status && customer.status !== filters.status) {
      return false;
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.code.toLowerCase().includes(searchTerm) ||
        customer.contact.name.toLowerCase().includes(searchTerm) ||
        customer.contact.email.toLowerCase().includes(searchTerm) ||
        customer.address.city.toLowerCase().includes(searchTerm) ||
        customer.address.state.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Get customer initials for avatar
  const getCustomerInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get avatar color based on customer name
  const getAvatarColor = (name) => {
    const colors = [
      '#1976d2', // blue
      '#388e3c', // green
      '#d32f2f', // red
      '#f57c00', // orange
      '#7b1fa2', // purple
      '#0288d1', // light blue
      '#c2185b', // pink
      '#00796b', // teal
      '#fbc02d'  // yellow
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Table columns
  const columns = [
    { 
      id: 'name', 
      label: 'Customer',
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: getAvatarColor(value),
              width: 32,
              height: 32,
              mr: 1
            }}
          >
            {getCustomerInitials(value)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.code}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      id: 'type', 
      label: 'Type',
      format: (value) => value.charAt(0).toUpperCase() + value.slice(1)
    },
    { 
      id: 'contact', 
      label: 'Contact',
      format: (contact) => (
        <Box>
          <Typography variant="body2">
            {contact.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {contact.email}
          </Typography>
        </Box>
      )
    },
    { 
      id: 'address', 
      label: 'Location',
      format: (address) => `${address.city}, ${address.state}`
    },
    { 
      id: 'status', 
      label: 'Status',
      format: (value) => <StatusChip status={value} />
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer accounts"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCustomer}
          >
            Add Customer
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="retailer">Retailer</MenuItem>
                <MenuItem value="wholesaler">Wholesaler</MenuItem>
                <MenuItem value="distributor">Distributor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        title="Customer List"
        loading={loading}
        error={error}
        onRowClick={handleRowClick}
      />

      {openForm && (
        <CustomerForm
          open={openForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          customer={selectedCustomer}
        />
      )}
    </Box>
  );
};

export default CustomerList;