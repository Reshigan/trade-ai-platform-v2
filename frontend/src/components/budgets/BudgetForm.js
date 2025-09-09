import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Divider
} from '@mui/material';
import { FormDialog } from '../common';
import { customerService } from '../../services/api';

// Mock customers data for development
const mockCustomers = [
  { id: '1', name: 'Walmart' },
  { id: '2', name: 'Target' },
  { id: '3', name: 'Costco' },
  { id: '4', name: 'Test Company' }
];

const BudgetForm = ({ open, onClose, onSubmit, budget = null }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() + 1,
    customer_id: '',
    total_amount: '',
    status: 'draft',
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    
    // If editing an existing budget, populate the form
    if (budget) {
      setFormData({
        year: budget.year,
        customer_id: budget.customer.id,
        total_amount: budget.total_amount,
        status: budget.status,
        notes: budget.notes || ''
      });
    }
  }, [budget]);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      // In a real app, we would call the API
      // const response = await customerService.getAll();
      // setCustomers(response.data);
      
      // Using mock data for development
      setCustomers(mockCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error for the field
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }
    
    if (!formData.total_amount) {
      newErrors.total_amount = 'Total amount is required';
    } else if (isNaN(formData.total_amount) || parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = 'Total amount must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setLoading(true);
      
      // Format data for API
      const budgetData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        allocated_amount: 0,
        remaining_amount: parseFloat(formData.total_amount)
      };
      
      // Submit form
      onSubmit(budgetData);
      setLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={budget ? 'Edit Budget' : 'Create Budget'}
      submitText={budget ? 'Update' : 'Create'}
      loading={loading}
    >
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              error={!!errors.year}
              helperText={errors.year}
              required
              inputProps={{ min: new Date().getFullYear() }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.customer_id} required>
              <InputLabel id="customer-label">Customer</InputLabel>
              <Select
                labelId="customer-label"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                label="Customer"
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.customer_id && (
                <FormHelperText>{errors.customer_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Total Amount"
              name="total_amount"
              type="number"
              value={formData.total_amount}
              onChange={handleChange}
              error={!!errors.total_amount}
              helperText={errors.total_amount}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
        
        {budget && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Budget Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(budget.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(budget.updated_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Allocated: ${budget.allocated_amount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Remaining: ${budget.remaining_amount.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </FormDialog>
  );
};

export default BudgetForm;