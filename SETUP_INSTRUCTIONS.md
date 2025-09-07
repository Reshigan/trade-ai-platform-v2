# Trade AI - Setup Instructions

## 🚀 Quick Start Guide

This document provides instructions for setting up and running the Trade AI application on your local machine.

## Prerequisites

- Node.js 16+ and npm
- Git
- MongoDB (optional - can run in mock mode)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Reshigan/trade-ai-final.git
cd trade-ai-final
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# The .env file is already configured with:
# - Mock database mode enabled (USE_MOCK_DB=true)
# - JWT secrets for authentication
# - Default ports (backend: 5000, frontend: 3000)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps
```

### 4. Running the Application

#### Option 1: Using the Start Script (Recommended)
```bash
# From the root directory
./start.sh
```

#### Option 2: Manual Start
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm start
```

## 🔧 Configuration Options

### Database Configuration

The application is configured to run in **mock database mode** by default, which means you don't need MongoDB installed to test the application.

To use a real MongoDB database:

1. **Local MongoDB**:
   - Install and start MongoDB locally
   - Update `.env`: `USE_MOCK_DB=false`

2. **MongoDB Atlas (Cloud)**:
   - Sign up for free at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create a free cluster
   - Update `MONGODB_URI` in `.env` with your connection string
   - Set `USE_MOCK_DB=false`

### Environment Variables

Key environment variables in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
USE_MOCK_DB=true                    # Set to false to use real MongoDB
MONGODB_URI=mongodb://localhost:27017/fmcg-trade-spend
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 📱 Accessing the Application

Once running, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🎨 Features Implemented

### Backend
- ✅ Complete REST API with authentication
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ All CRUD operations for:
  - Users & Authentication
  - Budgets & Budget Planning
  - Trade Spend Management
  - Promotions & Campaigns
  - Products, Customers, Vendors
  - Sales History & Analytics
  - Reports & Dashboards
- ✅ Mock database mode for easy testing
- ✅ Comprehensive error handling
- ✅ Request validation middleware

### Frontend
- ✅ Modern React 18 with TypeScript
- ✅ Material-UI v5 components
- ✅ Redux Toolkit for state management
- ✅ Complete routing setup
- ✅ Authentication forms
- ✅ Dashboard layouts
- ✅ Budget, Promotion, and Trade Spend forms
- ✅ Responsive design
- ✅ Modern logo and branding

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot find module" errors**:
   - Ensure you've run `npm install` in both backend and frontend directories
   - Check that you're in the correct directory

2. **MongoDB connection errors**:
   - The app runs in mock mode by default
   - To use real MongoDB, ensure it's running and update `.env`

3. **Port already in use**:
   - Backend uses port 5000, frontend uses port 3000
   - Change ports in `.env` files if needed

4. **npm install failures**:
   - Use `npm install --legacy-peer-deps` for the frontend
   - Clear npm cache: `npm cache clean --force`

## 📚 API Documentation

The backend provides comprehensive REST APIs:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Core Resources
- `/api/budgets` - Budget management
- `/api/promotions` - Promotion management
- `/api/trade-spends` - Trade spend tracking
- `/api/products` - Product catalog
- `/api/customers` - Customer management
- `/api/vendors` - Vendor management

### Analytics & Reporting
- `/api/dashboards/executive` - Executive dashboard
- `/api/dashboards/kam` - Key Account Manager dashboard
- `/api/analytics` - Analytics endpoints
- `/api/reports` - Report generation

## 🔐 Default Credentials

For testing purposes, you can create a user via the registration endpoint or use the seeding script (when MongoDB is connected).

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the README.md for detailed documentation
3. Check the error logs in the console

## 🎉 Next Steps

1. Explore the API using tools like Postman or Insomnia
2. Test the frontend forms and navigation
3. Connect to a real database for persistent data
4. Customize the branding and styling
5. Deploy to production (see deployment guide in README.md)

---

**Note**: This is a development setup. For production deployment, ensure you:
- Use strong, unique secrets for JWT
- Enable HTTPS
- Use a production database
- Set `NODE_ENV=production`
- Follow security best practices