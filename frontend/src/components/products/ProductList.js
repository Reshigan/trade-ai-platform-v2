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

// Mock data for development - South African products
const mockProducts = [
  {
    id: '1',
    name: 'Rooibos Tea',
    sku: 'RT-001',
    category: 'Beverages',
    status: 'active',
    price: 45.99,
    cost: 22.50,
    inventory: 1250,
    description: 'Premium South African Rooibos tea, naturally caffeine-free and rich in antioxidants.',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2025-03-10')
  },
  {
    id: '2',
    name: 'Biltong',
    sku: 'BLT-002',
    category: 'Snacks',
    status: 'active',
    price: 89.99,
    cost: 45.50,
    inventory: 850,
    description: 'Traditional South African dried, cured meat with signature spices.',
    created_at: new Date('2024-02-20'),
    updated_at: new Date('2025-04-15')
  },
  {
    id: '3',
    name: 'Amarula Cream Liqueur',
    sku: 'ACL-003',
    category: 'Alcoholic Beverages',
    status: 'active',
    price: 199.99,
    cost: 120.75,
    inventory: 500,
    description: 'Creamy liqueur made from the fruit of the African marula tree.',
    created_at: new Date('2024-03-05'),
    updated_at: new Date('2025-05-20')
  },
  {
    id: '4',
    name: 'Mrs. Ball\'s Chutney',
    sku: 'MBC-004',
    category: 'Condiments',
    status: 'active',
    price: 32.99,
    cost: 18.25,
    inventory: 1500,
    description: 'Iconic South African fruit chutney, perfect for meats and sandwiches.',
    created_at: new Date('2024-04-10'),
    updated_at: new Date('2025-06-15')
  },
  {
    id: '5',
    name: 'Ouma Rusks',
    sku: 'OR-005',
    category: 'Breakfast',
    status: 'active',
    price: 39.99,
    cost: 21.10,
    inventory: 1200,
    description: 'Traditional South African twice-baked bread, perfect for dipping in tea or coffee.',
    created_at: new Date('2024-05-15'),
    updated_at: new Date('2025-01-05')
  },
  {
    id: '6',
    name: 'Boerewors',
    sku: 'BW-006',
    category: 'Meat',
    status: 'active',
    price: 89.99,
    cost: 45.50,
    inventory: 300,
    description: 'Traditional South African sausage made with beef and spices.',
    created_at: new Date('2024-06-20'),
    updated_at: new Date('2025-02-10')
  },
  {
    id: '7',
    name: 'Cape Malay Curry Powder',
    sku: 'CMP-007',
    category: 'Spices',
    status: 'active',
    price: 29.99,
    cost: 14.50,
    inventory: 750,
    description: 'Authentic Cape Malay curry spice blend for traditional South African dishes.',
    created_at: new Date('2024-07-25'),
    updated_at: new Date('2025-03-15')
  },
  {
    id: '8',
    name: 'Malva Pudding Mix',
    sku: 'MPM-008',
    category: 'Desserts',
    status: 'active',
    price: 34.99,
    cost: 17.25,
    inventory: 600,
    description: 'Traditional South African sweet pudding mix with apricot jam.',
    created_at: new Date('2024-08-30'),
    updated_at: new Date('2025-04-20')
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