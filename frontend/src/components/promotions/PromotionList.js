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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { PageHeader, DataTable, StatusChip } from '../common';
import { promotionService, customerService } from '../../services/api';
import PromotionForm from './PromotionForm';

// Mock data for development
const mockPromotions = [
  {
    id: '1',
    name: 'Summer Sale',
    customer: { id: '1', name: 'Walmart' },
    budget: 50000,
    status: 'active',
    start_date: new Date('2025-06-01'),
    end_date: new Date('2025-06-30'),
    description: 'Summer promotion featuring seasonal products with special pricing.',
    created_at: new Date('2025-05-15'),
    updated_at: new Date('2025-05-15')
  },
  {
    id: '2',
    name: 'Back to School',
    customer: { id: '2', name: 'Target' },
    budget: 75000,
    status: 'planned',
    start_date: new Date('2025-08-01'),
    end_date: new Date('2025-08-31'),
    description: 'Back to school promotion with discounts on school supplies and electronics.',
    created_at: new Date('2025-06-10'),
    updated_at: new Date('2025-06-10')
  },
  {
    id: '3',
    name: 'Holiday Special',
    customer: { id: '3', name: 'Costco' },
    budget: 100000,
    status: 'planned',
    start_date: new Date('2025-12-01'),
    end_date: new Date('2025-12-31'),
    description: 'Holiday promotion featuring gift sets and seasonal products.',
    created_at: new Date('2025-07-20'),
    updated_at: new Date('2025-07-20')
  },
  {
    id: '4',
    name: 'Spring Clearance',
    customer: { id: '1', name: 'Walmart' },
    budget: 40000,
    status: 'completed',
    start_date: new Date('2025-03-01'),
    end_date: new Date('2025-03-31'),
    description: 'Spring clearance event to make room for summer inventory.',
    created_at: new Date('2025-02-15'),
    updated_at: new Date('2025-04-05')
  },
  {
    id: '5',
    name: 'Test Promotion',
    customer: { id: '4', name: 'Test Company' },
    budget: 30000,
    status: 'active',
    start_date: new Date('2025-09-01'),
    end_date: new Date('2025-09-30'),
    description: 'Test promotion for new product launch.',
    created_at: new Date('2025-08-15'),
    updated_at: new Date('2025-08-15')
  }
];

const PromotionList = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [filters, setFilters] = useState({
    customer: '',
    status: '',
    search: ''
  });
  const [customers, setCustomers] = useState([]);

  // Fetch promotions on component mount
  useEffect(() => {
    fetchPromotions();
    fetchCustomers();
  }, []);

  // Fetch promotions from API
  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call the API
      // const response = await promotionService.getAll();
      // setPromotions(response.data);
      
      // Using mock data for development
      setTimeout(() => {
        setPromotions(mockPromotions);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch promotions. Please try again.');
      setLoading(false);
    }
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      // In a real app, we would call the API
      // const response = await customerService.getAll();
      // setCustomers(response.data);
      
      // Using mock data for development
      const mockCustomers = [
        { id: '1', name: 'Walmart' },
        { id: '2', name: 'Target' },
        { id: '3', name: 'Costco' },
        { id: '4', name: 'Test Company' }
      ];
      setCustomers(mockCustomers);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
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
  const handleRowClick = (promotion) => {
    navigate(`/promotions/${promotion.id}`);
  };

  // Handle create promotion
  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    setOpenForm(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedPromotion(null);
  };

  // Handle form submit
  const handleFormSubmit = async (promotionData) => {
    try {
      if (selectedPromotion) {
        // Update existing promotion
        // await promotionService.update(selectedPromotion.id, promotionData);
      } else {
        // Create new promotion
        // await promotionService.create(promotionData);
      }
      
      // Refresh promotions
      fetchPromotions();
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving promotion:', err);
      // Handle error
    }
  };

  // Apply filters to promotions
  const filteredPromotions = promotions.filter((promotion) => {
    // Apply customer filter
    if (filters.customer && promotion.customer.id !== filters.customer) {
      return false;
    }
    
    // Apply status filter
    if (filters.status && promotion.status !== filters.status) {
      return false;
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        promotion.name.toLowerCase().includes(searchTerm) ||
        promotion.customer.name.toLowerCase().includes(searchTerm) ||
        promotion.description.toLowerCase().includes(searchTerm) ||
        promotion.status.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Table columns
  const columns = [
    { 
      id: 'name', 
      label: 'Promotion Name'
    },
    { 
      id: 'customer', 
      label: 'Customer',
      format: (customer) => customer.name
    },
    { 
      id: 'budget', 
      label: 'Budget',
      numeric: true,
      format: (value) => `$${value.toLocaleString()}`
    },
    { 
      id: 'start_date', 
      label: 'Start Date',
      format: (date) => format(new Date(date), 'MMM d, yyyy')
    },
    { 
      id: 'end_date', 
      label: 'End Date',
      format: (date) => format(new Date(date), 'MMM d, yyyy')
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
        title="Promotions"
        subtitle="Manage your promotional campaigns"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreatePromotion}
          >
            Create Promotion
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
                label="Customer"
                name="customer"
                value={filters.customer}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Customers</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
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
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
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
        data={filteredPromotions}
        title="Promotion List"
        loading={loading}
        error={error}
        onRowClick={handleRowClick}
      />

      {openForm && (
        <PromotionForm
          open={openForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          promotion={selectedPromotion}
          customers={customers}
        />
      )}
    </Box>
  );
};

export default PromotionList;