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

// No more mock data - using real API calls

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
      const response = await customerService.getAll();
      setCustomers(response.data || response);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "An error occurred");
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