# Trade AI Platform - Step-by-Step AWS Deployment Guide

## 🎯 Overview

This guide provides detailed step-by-step instructions for deploying your Trade AI Platform to AWS production environment.

**Key Information:**
- **Domain**: tradeai.gonxt.tech
- **Server IP**: 13.247.139.75
- **AI Agent**: Uses LOCAL machine learning models (scikit-learn) - NO external APIs required
- **Environment**: AWS Production with Docker Compose

## 📋 Prerequisites Checklist

### ✅ Before You Start

1. **Server Access**
   - [ ] SSH access to AWS server (13.247.139.75)
   - [ ] Root or sudo privileges on the server
   - [ ] Server running Ubuntu 20.04 LTS or later

2. **DNS Configuration**
   - [ ] Point `tradeai.gonxt.tech` A record to `13.247.139.75`
   - [ ] Point `www.tradeai.gonxt.tech` A record to `13.247.139.75`
   - [ ] DNS propagation completed (check with `nslookup tradeai.gonxt.tech`)

3. **Server Requirements**
   - [ ] Minimum 4GB RAM (8GB recommended)
   - [ ] Minimum 50GB disk space (100GB recommended)
   - [ ] Ports 80 and 443 accessible from internet

4. **Information Needed**
   - [ ] Email address for SSL certificate registration
   - [ ] No API keys required (AI uses local models)

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Your AWS Server

```bash
# Connect to your AWS server
ssh -i your-key.pem ubuntu@13.247.139.75

# Or if using password authentication
ssh root@13.247.139.75
```

### Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git

# Navigate to the project directory
cd trade-ai-platform-v2

# Verify you have the latest version
git pull origin main
```

### Step 3: Verify DNS Configuration

```bash
# Check if DNS is properly configured
nslookup tradeai.gonxt.tech

# Should return: 13.247.139.75
# If not, wait for DNS propagation or check your DNS settings
```

### Step 4: Quick Deployment (Recommended)

```bash
# Make the deployment script executable
chmod +x quick-deploy-aws.sh

# Run the quick deployment script
sudo ./quick-deploy-aws.sh
```

**What this script will ask:**
- Email for SSL certificates (default: admin@gonxt.tech)
- Confirmation to proceed

**What this script will do:**
1. Install all system dependencies (Docker, Docker Compose, etc.)
2. Configure firewall and security (UFW, Fail2Ban)
3. Generate SSL certificates with Let's Encrypt
4. Build and deploy all Docker containers
5. Configure Nginx reverse proxy
6. Set up monitoring and backups
7. Create management utilities

### Step 5: Monitor the Deployment

The deployment process will show progress. Watch for:

```bash
# You'll see output like:
[2024-01-XX XX:XX:XX] Step 1: Installing system prerequisites...
[2024-01-XX XX:XX:XX] Step 2: Installing Docker...
[2024-01-XX XX:XX:XX] Step 3: Configuring firewall...
[2024-01-XX XX:XX:XX] Step 4: Configuring Fail2Ban...
[2024-01-XX XX:XX:XX] Step 5: Creating necessary directories...
[2024-01-XX XX:XX:XX] Step 6: Setting up environment configuration...
[2024-01-XX XX:XX:XX] Step 7: Setting up SSL certificates...
[2024-01-XX XX:XX:XX] Step 8: Building and deploying containers...
[2024-01-XX XX:XX:XX] Step 9: Performing health checks...
[2024-01-XX XX:XX:XX] DEPLOYMENT COMPLETED SUCCESSFULLY!
```

### Step 6: Verify Deployment

After deployment completes, verify everything is working:

```bash
# Check service status
./scripts/manage-production.sh status

# Check health of all services
./scripts/manage-production.sh health

# View logs if needed
./scripts/manage-production.sh logs
```

### Step 7: Test Your Platform

1. **Open your browser** and navigate to: `https://tradeai.gonxt.tech`
2. **Verify SSL certificate** - should show as secure (green lock)
3. **Test the application** - should load the Trade AI Platform interface
4. **Test API endpoints**:
   - API: `https://tradeai.gonxt.tech/api/health`
   - AI Services: `https://tradeai.gonxt.tech/ai/health`
   - Monitoring: `https://tradeai.gonxt.tech/monitoring/health`

## 🤖 AI Agent Configuration

### Local Machine Learning Models

Your AI agent is configured to work **exclusively with system data** using local machine learning models:

#### ✅ What's Included:
- **Scikit-learn models** for trade predictions
- **Local data processing** using system trading data
- **No external API calls** to OpenAI or other services
- **Privacy-focused** - all data stays within your system

#### 🔧 AI Services Features:
- **Sales Prediction Models**: Random Forest, Gradient Boosting, Elastic Net
- **Promotion Impact Analysis**: ROI calculations based on historical data
- **Feature Importance Analysis**: Understand what drives your predictions
- **Local Model Training**: Train models on your specific trading data

#### 📊 AI Model Types Available:
1. **Ensemble Models** (Default) - Best overall performance
2. **Random Forest** - Good for feature importance
3. **Gradient Boosting** - High accuracy predictions
4. **Elastic Net** - Linear relationships

#### 🎯 How AI Agent Works:
1. **Data Input**: Uses trading data from your MongoDB database
2. **Model Training**: Trains on historical sales and promotion data
3. **Predictions**: Generates forecasts based on learned patterns
4. **No External Calls**: Everything runs locally on your server

## 🛠️ Management Commands

After deployment, use these commands to manage your platform:

### Service Management
```bash
# Start all services
./scripts/manage-production.sh start

# Stop all services
./scripts/manage-production.sh stop

# Restart all services
./scripts/manage-production.sh restart

# Check service status
./scripts/manage-production.sh status
```

### Monitoring and Health
```bash
# Check health of all services
./scripts/manage-production.sh health

# View logs for all services
./scripts/manage-production.sh logs

# View logs for specific service
./scripts/manage-production.sh logs backend
./scripts/manage-production.sh logs ai-services
./scripts/manage-production.sh logs frontend

# Show system monitoring info
./scripts/manage-production.sh monitor
```

### Backup and Maintenance
```bash
# Create backup
./scripts/manage-production.sh backup

# Update platform (pull latest code and rebuild)
./scripts/manage-production.sh update

# Clean up old containers and images
./scripts/manage-production.sh cleanup

# Renew SSL certificates (usually automatic)
./scripts/manage-production.sh ssl-renew
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual control or need to troubleshoot:

### Step 1: Manual System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Configure Environment
```bash
# Copy and edit environment file
cp .env.production .env.production.local
nano .env.production.local

# Update SSL_EMAIL if needed
```

### Step 3: SSL Setup
```bash
# Run SSL setup script
sudo ./scripts/setup-ssl.sh
```

### Step 4: Deploy Services
```bash
# Build and start containers
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Services Not Starting
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check logs for specific service
docker-compose -f docker-compose.production.yml logs [service_name]

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service_name]
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Manually renew certificates
sudo certbot renew

# Restart nginx after certificate renewal
docker-compose -f docker-compose.production.yml restart nginx
```

#### 3. Database Connection Issues
```bash
# Check MongoDB logs
docker logs trade-ai-mongodb-prod

# Connect to MongoDB shell
docker exec -it trade-ai-mongodb-prod mongosh -u tradeai_admin -p

# Check Redis
docker exec -it trade-ai-redis-prod redis-cli -a "your_redis_password"
```

#### 4. AI Services Not Working
```bash
# Check AI services logs
docker logs trade-ai-ai-services-prod

# Verify AI service health
curl -k https://localhost/ai/health

# Check if models are being loaded
docker exec -it trade-ai-ai-services-prod ls -la /app/models/
```

#### 5. Frontend Not Loading
```bash
# Check frontend logs
docker logs trade-ai-frontend-prod

# Verify frontend health
curl -k https://localhost/health.json

# Check nginx configuration
docker exec -it trade-ai-nginx-prod nginx -t
```

### Log Locations
- **Application logs**: `logs/`
- **Nginx logs**: `logs/nginx/`
- **System logs**: `/var/log/tradeai-*.log`

## 📊 System Architecture

```
Internet → Nginx (Port 80/443) → Docker Network
                ↓
    ┌─────────────────────────────────────┐
    │         Docker Network              │
    │  ┌─────────┐  ┌─────────┐          │
    │  │Frontend │  │Backend  │          │
    │  │React    │  │Node.js  │          │
    │  │:3001    │  │:5001    │          │
    │  └─────────┘  └─────────┘          │
    │  ┌─────────┐  ┌─────────┐          │
    │  │AI Svc   │  │Monitor  │          │
    │  │Python   │  │Node.js  │          │
    │  │:8000    │  │:8081    │          │
    │  └─────────┘  └─────────┘          │
    │  ┌─────────┐  ┌─────────┐          │
    │  │MongoDB  │  │Redis    │          │
    │  │:27017   │  │:6379    │          │
    │  └─────────┘  └─────────┘          │
    └─────────────────────────────────────┘
```

## 🔐 Security Features

### Network Security
- **UFW Firewall**: Only ports 22, 80, 443 open
- **Fail2Ban**: Intrusion prevention system
- **Internal Services**: All services bound to localhost except Nginx
- **Docker Network**: Isolated container network

### SSL/TLS Security
- **Let's Encrypt**: Free SSL certificates
- **TLS 1.2+**: Modern encryption protocols
- **HSTS**: HTTP Strict Transport Security
- **Security Headers**: CSP, X-Frame-Options, etc.

### Application Security
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Secure data processing
- **Security Logging**: Monitor for threats

## 📈 Monitoring and Maintenance

### Automated Features
- **Daily Backups**: 2 AM automatic backups
- **SSL Renewal**: Automatic certificate renewal
- **Log Rotation**: Daily log rotation with 30-day retention
- **Health Monitoring**: Every 5-minute health checks

### Manual Monitoring
```bash
# System resources
./scripts/manage-production.sh monitor

# Service health
./scripts/manage-production.sh health

# Recent logs
./scripts/manage-production.sh logs
```

## 🎉 Success Indicators

After successful deployment, you should see:

1. **✅ All services running**: `./scripts/manage-production.sh status`
2. **✅ Website accessible**: https://tradeai.gonxt.tech loads
3. **✅ SSL certificate valid**: Green lock in browser
4. **✅ API responding**: https://tradeai.gonxt.tech/api/health returns OK
5. **✅ AI services active**: https://tradeai.gonxt.tech/ai/health returns OK
6. **✅ Monitoring working**: https://tradeai.gonxt.tech/monitoring/health returns OK

## 📞 Support

If you encounter issues:

1. **Check logs first**: `./scripts/manage-production.sh logs`
2. **Verify health**: `./scripts/manage-production.sh health`
3. **Review system resources**: `./scripts/manage-production.sh monitor`
4. **Check this troubleshooting guide**
5. **Review comprehensive guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## 🎯 Quick Reference Commands

```bash
# Deploy everything
sudo ./quick-deploy-aws.sh

# Check status
./scripts/manage-production.sh status

# View logs
./scripts/manage-production.sh logs

# Health check
./scripts/manage-production.sh health

# Create backup
./scripts/manage-production.sh backup

# Restart services
./scripts/manage-production.sh restart
```

**Your Trade AI Platform with local AI models is ready for production! 🚀📈**