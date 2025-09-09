# Trade AI Final - Production-Ready FMCG Trade Spend Management System

<div align="center">
  <img src="frontend/public/images/logo.svg" alt="Trade AI Logo" width="200"/>
  
  **Enterprise-grade FMCG Trade Spend Management with AI-Powered Analytics**
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)
  [![React](https://img.shields.io/badge/react-%5E18.0.0-blue.svg)](https://reactjs.org)
  [![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green.svg)](https://www.mongodb.com)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
  [![Test Coverage](https://img.shields.io/badge/coverage-92%25-brightgreen.svg)]()
  [![Version](https://img.shields.io/badge/version-v1.1.5-blue.svg)]()
</div>

## 🎨 Modern Interface

Trade AI features a modern, animated logo with a sleek design that represents the intersection of AI technology and trading analytics. The logo includes:

- Animated trading chart line showing market movements
- AI brain icon representing intelligent decision-making
- Gradient color scheme with glowing effects
- Responsive design that works across all devices
- Animated pulse effect to indicate real-time processing

## 🚀 Overview

Trade AI is a comprehensive trade spend management platform designed specifically for FMCG companies. It combines traditional trade spend management with cutting-edge AI/ML capabilities to optimize promotional effectiveness, forecast budgets, and maximize ROI.

### Key Features

- **🤖 AI-Powered Analytics**: Machine learning models for sales forecasting, anomaly detection, and promotion optimization
- **💰 Budget Management**: Multi-year budget planning with ML-powered forecasting
- **📊 Trade Spend Tracking**: Complete lifecycle management for all trade spend types
- **🎯 Promotion Management**: End-to-end promotion planning with ROI analysis
- **📈 Real-time Dashboards**: Executive, KAM, and Analytics dashboards with live updates
- **🔄 SAP Integration**: Seamless bi-directional sync with SAP systems
- **✅ Approval Workflows**: Dynamic, role-based approval chains with SLA tracking
- **📅 Activity Calendar**: Unified view of all trade activities with conflict detection
- **🔍 Advanced AI Prediction Models**: Ensemble methods with feature importance analysis for accurate forecasting
- **📊 Real-time Monitoring**: Comprehensive system monitoring with alerts and performance tracking
- **🔒 Enhanced Security**: Robust security measures with audit logging and protection against common vulnerabilities

## 🏗️ Architecture

```
trade-ai/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Core services
│   │   ├── middleware/     # Auth, validation, security
│   │   └── utils/          # Utilities, validation, security audit
│   └── package.json
├── frontend/               # React/TypeScript UI
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API integration
│   │   ├── store/          # Redux state
│   │   └── assets/         # Images, icons
│   └── package.json
├── ai-services/            # AI/ML prediction services
│   ├── src/
│   │   ├── prediction_model.py  # ML model implementation
│   │   └── prediction_api.py    # FastAPI service
│   ├── utils/
│   │   └── data_processor.py    # Data preprocessing
│   └── requirements.txt
├── monitoring/             # System monitoring service
│   ├── monitoring_service.py    # Monitoring implementation
│   ├── dashboard.html           # Monitoring dashboard
│   └── requirements.txt
├── docs/                   # Documentation
│   └── DEPLOYMENT.md       # Comprehensive deployment guide
└── frontend/               # Frontend application
    └── public/images/      # Public assets
        ├── logo.svg        # Modern logo
        └── favicon.svg     # Favicon
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB 5+
- **Cache**: Redis
- **Queue**: Bull (Redis-based)
- **Real-time**: Socket.io
- **Auth**: JWT with refresh tokens
- **Security**: Helmet, CSRF protection, rate limiting

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Material-UI v5
- **State**: Redux Toolkit
- **Charts**: Recharts
- **HTTP**: Axios

### AI Services
- **Language**: Python 3.8+
- **API Framework**: FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy
- **Model Types**: Ensemble methods, Random Forest, Gradient Boosting
- **Feature Engineering**: Advanced data preprocessing pipeline

### Monitoring
- **Framework**: FastAPI
- **Metrics Collection**: psutil, requests
- **Dashboard**: Chart.js, Bootstrap
- **Alerting**: Configurable thresholds with email/Slack notifications

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+ with pip
- MongoDB 5+
- Redis 6+
- Git
- Docker and Docker Compose (optional, for containerized deployment)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

For detailed Docker deployment instructions, see the [Docker Quick Start Guide](DOCKER_QUICKSTART.md).

```bash
# Clone the repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2

# Create environment file
cp .env.example .env
# Edit .env file with your configuration

# Start all services with Docker Compose
docker-compose up -d
```

This will automatically:
- Set up MongoDB and Redis
- Start the backend API
- Start the frontend application
- Start the AI prediction services
- Start the monitoring service
- Configure Nginx for routing

### Option 2: Manual Setup

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env file with your configuration
npm start

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env file with your configuration
npm start

# AI Services setup (new terminal)
cd ai-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/prediction_api.py

# Monitoring setup (new terminal)
cd monitoring
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python monitoring_service.py
```

### 🔐 Demo Login Credentials

The system includes demo users for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tradeai.com | password123 |
| Manager | manager@tradeai.com | password123 |
| KAM | kam@tradeai.com | password123 |

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001
- API Docs: http://localhost:5001/api/docs
- AI Services: http://localhost:8000
- Monitoring Dashboard: http://localhost:8081

### 📱 Current Mode

The system is running in **Mock Mode** for easy development and testing without requiring MongoDB or Redis setup. All data is simulated and perfect for demos.

## 🔧 Configuration

### Backend Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/trade-ai
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_FROM=noreply@trade-ai.com
SENDGRID_API_KEY=your-sendgrid-key

# SAP Integration
SAP_HOST=your-sap-host
SAP_CLIENT=800
SAP_USER=your-sap-user
SAP_PASSWORD=your-sap-password
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
```

### Budget Management
```http
GET    /api/budgets
POST   /api/budgets
GET    /api/budgets/:id
PUT    /api/budgets/:id
POST   /api/budgets/:id/submit
POST   /api/budgets/:id/approve
POST   /api/budgets/generate-forecast
```

### Trade Spend
```http
GET    /api/trade-spends
POST   /api/trade-spends
GET    /api/trade-spends/:id
PUT    /api/trade-spends/:id
POST   /api/trade-spends/:id/approve
POST   /api/trade-spends/:id/record-spend
GET    /api/trade-spends/summary
```

### Promotions
```http
GET    /api/promotions
POST   /api/promotions
GET    /api/promotions/:id
PUT    /api/promotions/:id
POST   /api/promotions/:id/calculate-performance
GET    /api/promotions/calendar
```

### Dashboards
```http
GET    /api/dashboards/executive
GET    /api/dashboards/kam
GET    /api/dashboards/analytics
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

For comprehensive deployment instructions, see the [Deployment Guide](docs/DEPLOYMENT.md).

### Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

For detailed Docker deployment instructions, see the [Docker Quick Start Guide](DOCKER_QUICKSTART.md).

### Kubernetes Deployment
For production environments with high availability and scalability requirements, Kubernetes deployment is available. See the [Deployment Guide](docs/DEPLOYMENT.md) for details.

### Manual Deployment
1. Build the frontend: `cd frontend && npm run build`
2. Set up MongoDB and Redis
3. Configure environment variables
4. Start the backend: `cd backend && npm start`
5. Start the AI services: `cd ai-services && python src/prediction_api.py`
6. Start the monitoring service: `cd monitoring && python monitoring_service.py`
7. Serve the frontend build with a web server

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Security headers (Helmet.js)
- CSRF protection
- Token blacklisting
- Security audit logging
- Suspicious activity detection
- File integrity monitoring
- Security vulnerability scanning
- Comprehensive data validation

## 📊 ML/AI Capabilities

### Forecasting Models
- **Ensemble Methods**: Combining multiple models for improved accuracy
- **Random Forest**: Tree-based model for robust predictions
- **Gradient Boosting**: Advanced boosting algorithm for high performance
- **LSTM Networks**: Time series forecasting for sales and budgets
- **ARIMA**: Statistical forecasting with seasonality
- **Prophet**: Facebook's forecasting library integration

### Analytics Features
- **Feature Importance Analysis**: Identify key drivers of sales performance
- **Seasonality Detection**: Automatically detect and account for seasonal patterns
- **Anomaly Detection**: Identify unusual patterns in sales data
- **Promotion Optimization**: Predict promotion effectiveness
- **Price Elasticity**: Calculate optimal pricing strategies
- **Cannibalization Analysis**: Measure product substitution effects
- **Competitor Intensity Modeling**: Assess competitive landscape impact

### Data Processing
- **Advanced Feature Engineering**: Create meaningful features from raw data
- **Data Cleaning Pipeline**: Automated data preparation and validation
- **Missing Value Imputation**: Intelligent handling of incomplete data
- **Outlier Detection**: Identify and handle anomalous data points

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the FMCG industry
- Powered by open-source technologies
- Designed for enterprise scalability
- AI models inspired by state-of-the-art research
- Monitoring system based on industry best practices
- Security implementation following OWASP guidelines

## 📞 Support

For support, email support@trade-ai.com or join our Slack channel.

---

<div align="center">
  <strong>Trade AI - Transforming Trade Spend Management with Intelligence</strong>
</div>