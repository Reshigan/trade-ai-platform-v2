# GONXT Production Deployment - Step by Step Guide

## 🎯 Server Details
- **Server IP**: 13.247.139.75
- **Domain**: tradeai.gonxt.tech
- **Environment**: Production Single Server
- **Platform**: Trade AI Platform v2 with Advanced Analytics

## 🚀 Quick Deployment Steps

### Step 1: Connect to Server
```bash
# SSH to your AWS server
ssh -i your-key.pem ubuntu@13.247.139.75
```

### Step 2: Clone Repository
```bash
# Clone the latest version
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2
```

### Step 3: Deploy GONXT Production
```bash
# Run the GONXT-specific deployment script
chmod +x deploy-gonxt-production.sh
./deploy-gonxt-production.sh
```

**That's it!** The script will automatically:
- ✅ Verify you're on the correct server (13.247.139.75)
- ✅ Install Docker and Docker Compose if needed
- ✅ Clean up any previous deployments completely
- ✅ Build and deploy all services
- ✅ Generate SSL certificates for tradeai.gonxt.tech
- ✅ Seed GONXT demo data with 2+ years of historical data
- ✅ Run comprehensive health checks
- ✅ Display access information and demo credentials

## 🌐 Access Information

After deployment completes, you can access:

### Primary Access
- **Main URL**: https://tradeai.gonxt.tech
- **Frontend**: http://13.247.139.75:3001
- **Backend API**: http://13.247.139.75:5001/api
- **Health Check**: http://13.247.139.75:5001/api/health

### Demo Credentials for Prospective Customers

**GONXT Company (Primary Demo)**:
- **URL**: https://tradeai.gonxt.tech
- **Email**: admin@gonxt.tech
- **Password**: GonxtAdmin2024!
- **Features**: Complete FMCG trade spend management platform

**Test Company (Secondary Demo)**:
- **URL**: https://tradeai.gonxt.tech
- **Email**: admin@test.demo
- **Password**: TestAdmin2024!
- **Features**: Additional demonstration environment

## 📊 What Gets Deployed

### Complete Platform Stack
1. **Frontend**: React application with advanced UI
2. **Backend**: Node.js API with multi-tenant architecture
3. **Database**: MongoDB 7.0 with production configuration
4. **Cache**: Redis for session management
5. **Proxy**: Nginx with SSL and security headers
6. **AI Services**: Local ML models for analytics
7. **Monitoring**: System monitoring and health checks

### GONXT Demo Data (2+ Years Historical)
- **10 Major Customers**: Australian retailers (Woolworths, Coles, IGA, etc.)
- **25 Products**: Across 5 categories with realistic pricing
- **15 Campaigns**: Mix of historical and active promotions
- **Trading Terms**: Complex term structures with profitability
- **Budget Allocations**: Multi-level budget management
- **AI Chat History**: Realistic conversation data
- **Analytics Data**: Complete dataset for all advanced features

### Advanced Analytics Features
1. **Trading Terms Management** - Complex profitability calculations
2. **Advanced Reporting** - PDF/Excel exports with scheduling
3. **AI Chat Assistant** - Company-specific data insights
4. **Promotion Analysis** - ML-based success predictions
5. **Marketing Budget Allocation** - Flexible budget management
6. **Combination Analysis** - Long-term volume driver analysis

## 🔧 Management Commands

### Check Service Status
```bash
cd trade-ai-platform-v2
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform ps
```

### View Service Logs
```bash
# View all logs
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs -f

# View specific service logs
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs -f backend
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs -f frontend
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs -f mongodb
```

### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart

# Restart specific service
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart backend
```

### Stop/Start Platform
```bash
# Stop all services
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform down

# Start all services
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform up -d
```

## 🔒 SSL Certificate Setup (Optional)

The deployment script generates self-signed certificates. For production with real SSL:

### Option 1: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate for tradeai.gonxt.tech
sudo certbot certonly --standalone -d tradeai.gonxt.tech

# Copy certificates
sudo cp /etc/letsencrypt/live/tradeai.gonxt.tech/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/tradeai.gonxt.tech/privkey.pem ssl/
sudo chown ubuntu:ubuntu ssl/*.pem

# Restart nginx
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart nginx
```

### Option 2: Custom SSL Certificates
```bash
# Copy your certificates to ssl/ directory
cp your-certificate.crt ssl/fullchain.pem
cp your-private-key.key ssl/privkey.pem
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem

# Restart nginx
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart nginx
```

## 🔍 Troubleshooting

### Services Not Starting
```bash
# Check what's using the ports
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5001

# Check Docker logs
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs backend

# Restart deployment
./deploy-gonxt-production.sh
```

### Can't Access Frontend
1. **Check AWS Security Group**: Ensure ports 80, 443, 3001, 5001 are open
2. **Check Service Status**: `docker-compose ps`
3. **Check Nginx Logs**: `docker-compose logs nginx`
4. **Verify DNS**: Ensure tradeai.gonxt.tech points to 13.247.139.75

### Database Issues
```bash
# Check MongoDB status
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check database data
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform exec mongodb mongosh --eval "db.companies.countDocuments()"
```

### Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Consider upgrading to larger instance if needed
```

## 📈 Performance Monitoring

### System Resources
```bash
# Check system resources
htop
df -h
docker stats
```

### Application Health
- **Health Endpoint**: http://13.247.139.75:5001/api/health
- **Service Status**: `docker-compose ps`
- **Application Logs**: Available in `./logs/` directory

## 🎯 Customer Demonstration Ready

After successful deployment, your GONXT Trade AI Platform will be ready to demonstrate:

✅ **Complete FMCG Trade Spend Management**
✅ **Advanced Analytics with ML Predictions**
✅ **Multi-Tenant Architecture**
✅ **2+ Years of Realistic Demo Data**
✅ **All Advanced Features Enabled**
✅ **Production-Ready Performance**

## 📞 Support

If you encounter any issues:

1. **Check Service Logs**: `docker-compose logs [service_name]`
2. **Verify Health**: `curl http://13.247.139.75:5001/api/health`
3. **Restart Services**: `docker-compose restart`
4. **Re-run Deployment**: `./deploy-gonxt-production.sh`

---

**Deployment Time**: ~10-15 minutes
**Ready for Demos**: Immediately after deployment
**Platform Status**: Production Ready 🚀