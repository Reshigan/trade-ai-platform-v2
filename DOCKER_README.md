# Trade AI - Docker Deployment
## Diplomat South Africa Edition

![Trade AI Logo](frontend/public/trade-ai-logo.svg)

A comprehensive FMCG Trade Spend Management System deployed with Docker, pre-configured with test data for Diplomat South Africa.

## 🚀 Quick Start

```bash
# Clone and deploy
git clone https://github.com/your-org/trade-ai-final.git
cd trade-ai-final
./deploy-docker-macos.sh
```

The system will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs

## 📊 Pre-loaded Test Data

The deployment includes a full year of realistic FMCG data for Diplomat South Africa:

### Company Profile
- **Name**: Diplomat South Africa
- **Industry**: FMCG (Fast-Moving Consumer Goods)
- **Market**: South African retail chains
- **Currency**: ZAR (South African Rand)

### Data Overview
- **6 User Accounts** with role-based access
- **10 Major Retailers** (Shoprite, Pick n Pay, Woolworths, etc.)
- **17 Products** across 3 categories (Confectionery, Beverages, Personal Care)
- **60-80 Promotions** aligned with SA holidays and seasons
- **Annual Budgets** with quarterly breakdowns
- **Trade Spend Records** with settlement tracking
- **4 Major Campaigns** per year

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@diplomat-sa.co.za | Admin@2024 |
| **Trade Manager** | john.vandermerwe@diplomat-sa.co.za | Trade@2024 |
| **Sales Manager** | sarah.naidoo@diplomat-sa.co.za | Sales@2024 |
| **Finance Manager** | thabo.molefe@diplomat-sa.co.za | Finance@2024 |

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   MongoDB   │
│  (React)    │     │  (Node.js)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                    
                            ▼                    
                    ┌─────────────┐              
                    │    Redis    │              
                    │   (Cache)   │              
                    └─────────────┘              
```

## 🛠️ Key Features

### Trade Spend Management
- Promotion planning and tracking
- Budget allocation and monitoring
- ROI analysis and reporting
- Automated approval workflows

### Analytics & Insights
- Real-time dashboards
- Performance metrics
- Predictive analytics
- Custom reporting

### Integration Ready
- RESTful API
- WebSocket support
- SAP integration endpoints
- Export capabilities

## 📦 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| MongoDB | 27017 | Primary database |
| Redis | 6379 | Caching & sessions |
| Backend | 5000 | REST API |
| Frontend | 3000 | Web UI |
| Nginx | 80/443 | Reverse proxy (optional) |

## 🔧 Management

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Database
```bash
# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p tradeai2024

# Redis CLI
docker-compose exec redis redis-cli -a tradeai2024
```

### Restart Services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Stop Everything
```bash
docker-compose down
```

## 📈 Performance

The system is optimized for:
- **Concurrent Users**: 100+
- **Data Volume**: 1M+ records
- **Response Time**: <200ms average
- **Uptime**: 99.9% target

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Encrypted passwords
- API rate limiting
- CORS protection

## 📱 Browser Support

- Chrome (recommended)
- Safari
- Firefox
- Edge
- Mobile browsers

## 🆘 Troubleshooting

### Port Conflicts
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 [PID]
```

### Memory Issues
Increase Docker memory allocation to 4GB+ in Docker Desktop settings.

### Build Errors
```bash
# Clean and rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
```

## 📞 Support

For assistance:
1. Check [Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md)
2. Review application logs
3. Contact: support@diplomat-sa.co.za

---

**Version**: 1.0.0  
**License**: Proprietary  
**© 2024 Diplomat South Africa**