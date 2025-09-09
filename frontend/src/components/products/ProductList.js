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
import { productService } from '../../services/api';
import ProductForm from './ProductForm';

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Premium Cereal',
    sku: 'PC-001',
    category: 'Breakfast',
    status: 'active',
    price: 4.99,
    cost: 2.25,
    inventory: 1250,
    description: 'Premium breakfast cereal with whole grains and natural sweeteners.',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2025-03-10')
  },
  {
    id: '2',
    name: 'Organic Granola',
    sku: 'OG-002',
    category: 'Breakfast',
    status: 'active',
    price: 6.99,
    cost: 3.50,
    inventory: 850,
    description: 'Organic granola with nuts, seeds, and dried fruits.',
    created_at: new Date('2024-02-20'),
    updated_at: new Date('2025-04-15')
  },
  {
    id: '3',
    name: 'Chocolate Cookies',
    sku: 'CC-003',
    category: 'Snacks',
    status: 'active',
    price: 3.49,
    cost: 1.75,
    inventory: 2000,
    description: 'Delicious chocolate cookies made with premium cocoa.',
    created_at: new Date('2024-03-05'),
    updated_at: new Date('2025-05-20')
  },
  {
    id: '4',
    name: 'Fruit Juice',
    sku: 'FJ-004',
    category: 'Beverages',
    status: 'active',
    price: 2.99,
    cost: 1.25,
    inventory: 1500,
    description: '100% natural fruit juice with no added sugars.',
    created_at: new Date('2024-04-10'),
    updated_at: new Date('2025-06-15')
  },
  {
    id: '5',
    name: 'Potato Chips',
    sku: 'PC-005',
    category: 'Snacks',
    status: 'inactive',
    price: 2.49,
    cost: 1.10,
    inventory: 0,
    description: 'Crispy potato chips with sea salt.',
    created_at: new Date('2024-05-15'),
    updated_at: new Date('2025-01-05')
  }
];

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call the API
      // const response = await productService.getAll();
      // setProducts(response.data);
      
      // Using mock data for development
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
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
  const handleRowClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  // Handle create product
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setOpenForm(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedProduct(null);
  };

  // Handle form submit
  const handleFormSubmit = async (productData) => {
    try {
      if (selectedProduct) {
        // Update existing product
        // await productService.update(selectedProduct.id, productData);
      } else {
        // Create new product
        // await productService.create(productData);
      }
      
      // Refresh products
      fetchProducts();
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      // Handle error
    }
  };

  // Apply filters to products
  const filteredProducts = products.filter((product) => {
    // Apply category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Apply status filter
    if (filters.status && product.status !== filters.status) {
      return false;
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Get unique categories for filter
  const categories = [...new Set(products.map(product => product.category))];

  // Table columns
  const columns = [
    { 
      id: 'name', 
      label: 'Product',
      format: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.sku}
          </Typography>
        </Box>
      )
    },
    { 
      id: 'category', 
      label: 'Category'
    },
    { 
      id: 'price', 
      label: 'Price',
      numeric: true,
      format: (value) => `$${value.toFixed(2)}`
    },
    { 
      id: 'inventory', 
      label: 'Inventory',
      numeric: true,
      format: (value) => value.toLocaleString()
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
        title="Products"
        subtitle="Manage your product catalog"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProduct}
          >
            Add Product
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
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
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
        data={filteredProducts}
        title="Product List"
        loading={loading}
        error={error}
        onRowClick={handleRowClick}
      />

      {openForm && (
        <ProductForm
          open={openForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          product={selectedProduct}
        />
      )}
    </Box>
  );
};

export default ProductList;