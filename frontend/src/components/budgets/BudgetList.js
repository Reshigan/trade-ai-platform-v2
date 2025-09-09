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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { PageHeader, DataTable, StatusChip } from '../common';
import { budgetService } from '../../services/api';
import BudgetForm from './BudgetForm';

// Mock data for development
const mockBudgets = [
  {
    id: '1',
    year: 2025,
    customer: { id: '1', name: 'Walmart' },
    total_amount: 1000000,
    allocated_amount: 750000,
    remaining_amount: 250000,
    status: 'approved',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-20')
  },
  {
    id: '2',
    year: 2025,
    customer: { id: '2', name: 'Target' },
    total_amount: 750000,
    allocated_amount: 500000,
    remaining_amount: 250000,
    status: 'approved',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-20')
  },
  {
    id: '3',
    year: 2025,
    customer: { id: '3', name: 'Costco' },
    total_amount: 500000,
    allocated_amount: 300000,
    remaining_amount: 200000,
    status: 'approved',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-20')
  },
  {
    id: '4',
    year: 2025,
    customer: { id: '4', name: 'Test Company' },
    total_amount: 250000,
    allocated_amount: 100000,
    remaining_amount: 150000,
    status: 'approved',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-20')
  },
  {
    id: '5',
    year: 2026,
    customer: { id: '1', name: 'Walmart' },
    total_amount: 1200000,
    allocated_amount: 0,
    remaining_amount: 1200000,
    status: 'draft',
    created_at: new Date('2025-08-15'),
    updated_at: new Date('2025-08-15')
  }
];

const BudgetList = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    status: '',
    search: ''
  });

  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Fetch budgets from API
  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call the API
      // const response = await budgetService.getAll();
      // setBudgets(response.data);
      
      // Using mock data for development
      setTimeout(() => {
        setBudgets(mockBudgets);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch budgets. Please try again.');
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
  const handleRowClick = (budget) => {
    navigate(`/budgets/${budget.id}`);
  };

  // Handle create budget
  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setOpenForm(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedBudget(null);
  };

  // Handle form submit
  const handleFormSubmit = async (budgetData) => {
    try {
      if (selectedBudget) {
        // Update existing budget
        // await budgetService.update(selectedBudget.id, budgetData);
      } else {
        // Create new budget
        // await budgetService.create(budgetData);
      }
      
      // Refresh budgets
      fetchBudgets();
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving budget:', err);
      // Handle error
    }
  };

  // Apply filters to budgets
  const filteredBudgets = budgets.filter((budget) => {
    // Apply year filter
    if (filters.year && budget.year.toString() !== filters.year) {
      return false;
    }
    
    // Apply status filter
    if (filters.status && budget.status !== filters.status) {
      return false;
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        budget.customer.name.toLowerCase().includes(searchTerm) ||
        budget.year.toString().includes(searchTerm) ||
        budget.status.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Table columns
  const columns = [
    { id: 'year', label: 'Year' },
    { 
      id: 'customer', 
      label: 'Customer',
      format: (customer) => customer.name
    },
    { 
      id: 'total_amount', 
      label: 'Total Amount',
      numeric: true,
      format: (value) => `$${value.toLocaleString()}`
    },
    { 
      id: 'allocated_amount', 
      label: 'Allocated',
      numeric: true,
      format: (value) => `$${value.toLocaleString()}`
    },
    { 
      id: 'remaining_amount', 
      label: 'Remaining',
      numeric: true,
      format: (value) => `$${value.toLocaleString()}`
    },
    { 
      id: 'status', 
      label: 'Status',
      format: (value) => <StatusChip status={value} />
    },
    { 
      id: 'updated_at', 
      label: 'Last Updated',
      format: (date) => format(new Date(date), 'MMM d, yyyy')
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Budgets"
        subtitle="Manage your trade spend budgets"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateBudget}
          >
            Create Budget
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                select
                label="Year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2027">2027</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={6}>
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
        data={filteredBudgets}
        title="Budget List"
        loading={loading}
        error={error}
        onRowClick={handleRowClick}
      />

      {openForm && (
        <BudgetForm
          open={openForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          budget={selectedBudget}
        />
      )}
    </Box>
  );
};

export default BudgetList;