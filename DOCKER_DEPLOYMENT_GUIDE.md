# Trade AI Docker Deployment Guide
## Diplomat South Africa Edition

This guide provides comprehensive instructions for deploying Trade AI using Docker on macOS with pre-populated test data for Diplomat South Africa.

## 📋 Prerequisites

1. **Docker Desktop for Mac**
   - Download from: https://www.docker.com/products/docker-desktop
   - Minimum 4GB RAM allocated to Docker
   - At least 10GB free disk space

2. **System Requirements**
   - macOS 10.15 (Catalina) or later
   - Intel or Apple Silicon processor
   - 8GB RAM minimum (16GB recommended)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/trade-ai-final.git
cd trade-ai-final

# Make deployment script executable
chmod +x deploy-docker-macos.sh

# Run the deployment
./deploy-docker-macos.sh
```

## 🏗️ Architecture Overview

The Docker deployment includes:

- **MongoDB**: Primary database for all application data
- **Redis**: Caching and session management
- **Backend API**: Node.js/Express REST API
- **Frontend**: React-based user interface
- **Nginx**: Reverse proxy (optional)

## 📦 Container Configuration

### Services and Ports

| Service | Container Name | Internal Port | External Port |
|---------|---------------|---------------|---------------|
| MongoDB | trade-ai-mongodb | 27017 | 27017 |
| Redis | trade-ai-redis | 6379 | 6379 |
| Backend | trade-ai-backend | 5000 | 5000 |
| Frontend | trade-ai-frontend | 80 | 3000 |
| Nginx | trade-ai-nginx | 80/443 | 80/443 |

### Environment Variables

Key environment variables configured:

```env
# Database
MONGODB_URI=mongodb://admin:tradeai2024@mongodb:27017/trade-ai?authSource=admin
REDIS_URL=redis://:tradeai2024@redis:6379

# Company Configuration
COMPANY_NAME=Diplomat South Africa
COMPANY_CODE=DIPSA

# Security
JWT_SECRET=diplomat-sa-jwt-secret-2024
```

## 📊 Test Data Overview

The deployment automatically generates comprehensive test data for Diplomat South Africa:

### Company Context
- **Industry**: FMCG (Fast-Moving Consumer Goods)
- **Location**: South Africa
- **Currency**: ZAR (South African Rand)
- **Fiscal Year**: January - December

### Data Generated

1. **Users** (6 accounts)
   - System Administrator
   - Trade Marketing Manager
   - Sales Manager
   - Finance Manager
   - 2 Sales Representatives

2. **Customers** (10 major retailers)
   - Shoprite Holdings
   - Pick n Pay
   - Woolworths
   - Spar Group
   - Checkers
   - Makro
   - And more...

3. **Products** (17 SKUs across 3 categories)
   - **Confectionery**: Ferrero Rocher, Kinder, Nutella, Tic Tac
   - **Beverages**: Red Bull, Monster Energy
   - **Personal Care**: Nivea, Dove

4. **Promotions** (60-80 per year)
   - Seasonal campaigns aligned with South African holidays
   - Various types: discounts, BOGO, volume deals, displays

5. **Budgets** (Annual budgets for each customer)
   - Quarterly breakdowns
   - Category allocations

6. **Trade Spends** (Historical spending records)
   - Linked to promotions
   - Settlement tracking

7. **Campaigns** (4 major annual campaigns)
   - Easter Chocolate Festival
   - Winter Warmth Campaign
   - Spring Into Wellness
   - Festive Season Spectacular

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@diplomat-sa.co.za | Admin@2024 |
| Trade Manager | john.vandermerwe@diplomat-sa.co.za | Trade@2024 |
| Sales Manager | sarah.naidoo@diplomat-sa.co.za | Sales@2024 |
| Finance Manager | thabo.molefe@diplomat-sa.co.za | Finance@2024 |
| Sales Rep (GP) | priya.pillay@diplomat-sa.co.za | Sales@2024 |
| Sales Rep (WC) | david.botha@diplomat-sa.co.za | Sales@2024 |

## 🛠️ Management Commands

### Container Management

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Stop and remove volumes (caution: deletes data)
docker-compose down -v

# Restart a service
docker-compose restart [service-name]

# Execute commands in container
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

### Database Management

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p tradeai2024

# Access Redis CLI
docker-compose exec redis redis-cli -a tradeai2024
```

### Data Management

```bash
# Regenerate test data
docker-compose exec backend node scripts/generate-diplomat-data.js

# Export data
docker-compose exec mongodb mongoexport --db=trade-ai --collection=promotions --out=/tmp/promotions.json

# Clear all data (caution!)
docker-compose exec backend node scripts/clear-database.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 [PID]
   ```

2. **Docker Desktop Not Running**
   - Open Docker Desktop application
   - Wait for Docker engine to start
   - Retry deployment

3. **Insufficient Memory**
   - Open Docker Desktop preferences
   - Increase memory allocation to at least 4GB
   - Restart Docker Desktop

4. **Build Failures**
   ```bash
   # Clean build cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Health Checks

```bash
# Check service health
curl http://localhost:5000/api/health
curl http://localhost:3000/health

# MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis health
docker-compose exec redis redis-cli ping
```

## 📈 Performance Optimization

### Docker Settings
1. Allocate at least 4GB RAM to Docker
2. Enable "Use the new Virtualization framework" (Apple Silicon)
3. Increase disk image size if needed

### Application Tuning
- Redis is configured for persistence
- MongoDB indexes are automatically created
- Frontend assets are gzip compressed

## 🔒 Security Considerations

### Production Deployment
1. Change all default passwords
2. Use environment-specific JWT secrets
3. Enable SSL/TLS for all services
4. Implement proper firewall rules
5. Regular security updates

### Secrets Management
```bash
# Create .env file for production
cp .env.example .env.production
# Edit with production values
```

## 📱 Accessing the Application

### Web Interface
- **URL**: http://localhost:3000
- **Features**: Full responsive design
- **Browsers**: Chrome, Safari, Firefox, Edge

### API Documentation
- **URL**: http://localhost:5000/api/docs
- **Format**: OpenAPI/Swagger
- **Authentication**: Bearer token required

### Database GUI Tools
- **MongoDB Compass**: mongodb://admin:tradeai2024@localhost:27017
- **RedisInsight**: redis://:tradeai2024@localhost:6379

## 🚦 Monitoring

### Container Stats
```bash
# Real-time stats
docker stats

# Detailed inspection
docker-compose logs -f --tail=100
```

### Application Metrics
- API response times logged
- Database query performance tracked
- Redis cache hit rates available

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Strategy
1. Daily MongoDB backups recommended
2. Redis snapshots for session data
3. Application logs rotation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Contact: support@diplomat-sa.co.za

---

**Version**: 1.0.0  
**Last Updated**: September 2024  
**Company**: Diplomat South Africa