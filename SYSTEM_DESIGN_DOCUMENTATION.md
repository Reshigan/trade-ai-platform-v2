# Trade AI Platform v2 - System Design Documentation

## 🏗️ System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   AI Services   │              │
         └──────────────►│   (Python)     │◄─────────────┘
                        │   Port: 8000    │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Nginx         │
                        │   (Reverse      │
                        │    Proxy)       │
                        │   Port: 80/443  │
                        └─────────────────┘
```

### Production Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AWS EC2 Instance                        │
│                  IP: 13.247.139.75                         │
│                Domain: tradeai.gonxt.tech                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Nginx     │  │   Docker    │  │   SSL/TLS   │        │
│  │   Proxy     │  │   Compose   │  │   Certbot   │        │
│  │   Port 443  │  │   Services  │  │   Let's     │        │
│  │             │  │             │  │   Encrypt   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker Containers                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │Frontend │ │Backend  │ │MongoDB  │ │AI Svc   │   │   │
│  │  │React    │ │Node.js  │ │Database │ │Python   │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components

### 1. Frontend (React Application)
- **Technology**: React 18, Material-UI, React Router
- **Port**: 3000 (development), served via Nginx (production)
- **Key Features**:
  - Role-based access control
  - Real-time data visualization
  - Responsive design
  - Progressive Web App capabilities

### 2. Backend (Node.js API)
- **Technology**: Node.js, Express.js, Mongoose
- **Port**: 5001
- **Key Features**:
  - RESTful API architecture
  - JWT authentication
  - Role-based authorization
  - Data validation and sanitization
  - Error handling and logging

### 3. Database (MongoDB)
- **Technology**: MongoDB 7.0
- **Port**: 27017
- **Key Features**:
  - Document-based storage
  - Flexible schema design
  - Built-in replication support
  - Aggregation pipeline for analytics

### 4. AI Services (Python)
- **Technology**: Python, FastAPI, scikit-learn
- **Port**: 8000
- **Key Features**:
  - Local ML models (no external APIs)
  - Natural language processing
  - Predictive analytics
  - Recommendation engine

### 5. Web Server (Nginx)
- **Technology**: Nginx
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Key Features**:
  - Reverse proxy
  - SSL termination
  - Static file serving
  - Load balancing
  - Security headers

## 🔐 Security Architecture

### Authentication & Authorization
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │    │   JWT Token     │    │   Role Check    │
│                 │───►│   Generation    │───►│   & Access      │
│   Credentials   │    │                 │    │   Control       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Role Hierarchy
1. **Super Admin**: Can create companies, manage system settings
2. **Admin**: Can manage company users, setup SSO, view all company data
3. **Manager**: Can view analytics, create/manage promotions
4. **KAM**: Can view analytics, create promotions
5. **User**: Can view analytics only

### Security Measures
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- SSL/TLS encryption
- Security headers (CSP, HSTS, etc.)

## 📊 Data Architecture

### Database Schema Design

#### Core Collections
```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String,
  companyId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Companies Collection
{
  _id: ObjectId,
  name: String,
  domain: String,
  settings: {
    ssoEnabled: Boolean,
    sapIntegration: Boolean,
    timezone: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Promotions Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  companyId: ObjectId,
  customerId: ObjectId,
  budget: Number,
  status: String,
  startDate: Date,
  endDate: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Customers Collection
{
  _id: ObjectId,
  name: String,
  companyId: ObjectId,
  contactInfo: {
    email: String,
    phone: String,
    address: Object
  },
  sapId: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Products Collection
{
  _id: ObjectId,
  name: String,
  sku: String,
  companyId: ObjectId,
  category: String,
  price: Number,
  sapId: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Data Flow Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SAP       │───►│   Backend   │───►│   MongoDB   │───►│   Frontend  │
│   System    │    │   API       │    │   Database  │    │   UI        │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │                  ▼                  ▼                  ▼
       │           ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       └──────────►│   AI        │    │   Analytics │    │   Real-time │
                   │   Services  │    │   Engine    │    │   Updates   │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

## 🤖 AI & ML Architecture

### Local ML Models (No External APIs)
- **Recommendation Engine**: Collaborative filtering for promotion recommendations
- **Anomaly Detection**: Statistical models for budget anomaly detection
- **Trend Analysis**: Time series analysis for sales trends
- **Natural Language Processing**: Local NLP for chatbot functionality
- **Predictive Analytics**: Regression models for performance prediction

### AI Chatbot Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Query    │───►│   Intent        │───►│   Data Query    │
│   (Natural      │    │   Analysis      │    │   Engine        │
│   Language)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Response      │◄───│   ML Models     │◄───│   MongoDB       │
│   Generation    │    │   (Local)       │    │   Data          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔗 Integration Architecture

### SAP Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SAP System    │◄──►│   Integration   │◄──►│   MongoDB       │
│   (ERP)         │    │   Service       │    │   Database      │
│                 │    │                 │    │                 │
│   - Customers   │    │   - Data Sync   │    │   - Local Data  │
│   - Products    │    │   - Mapping     │    │   - Cache       │
│   - Sales Data  │    │   - Validation  │    │   - Analytics   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Synchronization Flow
1. **Scheduled Sync**: Automated data synchronization at configured intervals
2. **Real-time Sync**: Event-driven synchronization for critical data
3. **Conflict Resolution**: Automated and manual conflict resolution
4. **Data Validation**: Schema validation and business rule checks
5. **Error Handling**: Comprehensive error logging and retry mechanisms

## 🚀 Deployment Architecture

### Docker Containerization
```yaml
# docker-compose.production.yml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - REACT_APP_API_URL=https://tradeai.gonxt.tech/api
      - REACT_APP_DEMO_MODE=false
  
  backend:
    build: ./backend
    ports: ["5001:5001"]
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/tradeai
      - JWT_SECRET=${JWT_SECRET}
  
  mongo:
    image: mongo:7.0
    ports: ["27017:27017"]
    volumes:
      - mongo_data:/data/db
  
  ai-services:
    build: ./ai-services
    ports: ["8000:8000"]
    environment:
      - ENVIRONMENT=production
  
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
```

### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
MONGODB_URI=mongodb://mongo:27017/tradeai_production
JWT_SECRET=your_super_secure_jwt_secret_here
REACT_APP_API_URL=https://tradeai.gonxt.tech/api
REACT_APP_DEMO_MODE=false
SAP_HOST=your_sap_host
SAP_USERNAME=your_sap_username
SAP_PASSWORD=your_sap_password
```

## 📈 Performance & Scalability

### Performance Optimizations
- **Database Indexing**: Optimized indexes for frequent queries
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Static asset delivery via CDN
- **Compression**: Gzip compression for API responses
- **Lazy Loading**: Component-based lazy loading in frontend
- **Connection Pooling**: Database connection pooling

### Scalability Considerations
- **Horizontal Scaling**: Load balancer support for multiple backend instances
- **Database Sharding**: MongoDB sharding for large datasets
- **Microservices**: Modular architecture for independent scaling
- **Container Orchestration**: Kubernetes support for production scaling

## 🔍 Monitoring & Logging

### Application Monitoring
- **Health Checks**: Automated health monitoring for all services
- **Performance Metrics**: Response time and throughput monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **User Analytics**: User behavior and usage analytics

### Log Management
```javascript
// Centralized logging structure
{
  timestamp: "2025-01-11T10:30:00Z",
  level: "info|warn|error",
  service: "frontend|backend|ai-services",
  userId: "user_id",
  companyId: "company_id",
  action: "action_performed",
  details: { /* additional context */ },
  requestId: "unique_request_id"
}
```

## 🛡️ Backup & Recovery

### Data Backup Strategy
- **Automated Backups**: Daily MongoDB backups
- **Incremental Backups**: Hourly incremental backups
- **Cross-Region Replication**: Backup replication to different regions
- **Point-in-Time Recovery**: Ability to restore to specific timestamps

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup Verification**: Regular backup integrity checks
4. **Recovery Testing**: Monthly disaster recovery drills

## 📋 API Documentation

### Core API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Promotions
- `GET /api/promotions` - Get all promotions
- `POST /api/promotions` - Create new promotion
- `PUT /api/promotions/:id` - Update promotion
- `DELETE /api/promotions/:id` - Delete promotion

#### AI Chatbot
- `GET /api/ai/chatbot/initialize` - Initialize chatbot
- `POST /api/ai/chatbot/message` - Send message to chatbot
- `POST /api/ai/chatbot/data-query` - Query data using AI
- `POST /api/ai/chatbot/insights` - Generate AI insights

#### SAP Integration
- `POST /api/sap/test-connection` - Test SAP connection
- `POST /api/sap/sync` - Sync data from SAP
- `GET /api/sap/status` - Get sync status

## 🔧 Development Guidelines

### Code Standards
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit testing framework
- **Cypress**: End-to-end testing

### Git Workflow
1. **Feature Branches**: All development in feature branches
2. **Pull Requests**: Code review required for all changes
3. **Automated Testing**: CI/CD pipeline with automated tests
4. **Semantic Versioning**: Version management using semantic versioning

### Environment Management
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

---

## 📞 Support & Maintenance

### System Requirements
- **Minimum RAM**: 8GB
- **Minimum Storage**: 100GB SSD
- **Network**: Stable internet connection
- **OS**: Ubuntu 20.04+ or similar Linux distribution

### Maintenance Schedule
- **Daily**: Automated backups and health checks
- **Weekly**: Security updates and performance monitoring
- **Monthly**: Full system maintenance and optimization
- **Quarterly**: Security audits and disaster recovery testing

---

*This documentation is maintained by the development team and updated with each major release.*