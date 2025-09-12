# Trade AI Platform v2 - AWS Quick Start

## 🚀 One-Command AWS Deployment

Deploy the complete Trade AI Platform with GONXT demo data in minutes on AWS.

### Prerequisites
- AWS EC2 instance (Ubuntu 22.04 LTS)
- Minimum: t3.large (2 vCPU, 8GB RAM)
- Ports open: 22, 80, 443, 3001, 5001

### Quick Deployment

**Option 1: Super Quick (One Command)**
```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/quick-aws-deploy.sh | bash
```

**Option 2: Manual Steps**
```bash
# 1. Clone repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2

# 2. Run deployment
chmod +x aws-production-deploy.sh
./aws-production-deploy.sh
```

### What Gets Deployed

✅ **Complete Trade AI Platform v2**
- Frontend React application
- Backend Node.js API
- MongoDB 7.0 database
- Redis caching
- Nginx reverse proxy
- AI services
- Monitoring dashboard

✅ **GONXT Demo Environment**
- 2+ years of historical data
- 10 major Australian retail customers
- 25 products across 5 categories
- 15 promotional campaigns
- Advanced analytics features

✅ **Multi-Tenant Architecture**
- GONXT company (primary demo)
- Test company (secondary demo)
- Complete data isolation

### Access Information

**Frontend**: http://your-aws-ip:3001
**Backend API**: http://your-aws-ip:5001/api

**Demo Credentials**:
- **GONXT**: admin@gonxt.tech / GonxtAdmin2024!
- **Test**: admin@test.demo / TestAdmin2024!

### Advanced Analytics Features

1. **Trading Terms Management** - Complex profitability calculations
2. **Advanced Reporting** - PDF/Excel exports with scheduling
3. **AI Chat Assistant** - Company-specific data insights
4. **Promotion Analysis** - ML-based success predictions
5. **Marketing Budget Allocation** - Flexible budget management
6. **Combination Analysis** - Long-term volume driver analysis

### Management Commands

```bash
# Check status
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform ps

# View logs
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs -f [service]

# Restart services
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart

# Stop all
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform down
```

### Troubleshooting

**Services not starting?**
```bash
# Check logs
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs backend

# Restart deployment
./aws-production-deploy.sh
```

**Can't access frontend?**
- Check AWS Security Group allows port 3001
- Verify instance public IP
- Check if services are running: `docker-compose ps`

### Support

- **Health Check**: http://your-ip:5001/api/health
- **Full Documentation**: [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
- **Service Logs**: `docker-compose logs -f [service_name]`

---

**Ready in 10-15 minutes!** 🚀