# Trade AI Platform v2 - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Trade AI Platform v2 to production on AWS server 13.247.139.75 (tradeai.gonxt.tech).

## Architecture

The production deployment uses a multi-container Docker setup with:

- **Frontend**: React application served by Nginx
- **Backend**: Node.js API server
- **Database**: MongoDB with authentication
- **Cache**: Redis for session management
- **Reverse Proxy**: Nginx with SSL termination
- **AI Services**: Local ML models for predictions
- **Monitoring**: Health checks and system monitoring

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04 LTS or later
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: Minimum 100GB SSD
- **CPU**: Minimum 4 cores, Recommended 8 cores
- **Network**: Public IP with ports 80, 443, and 22 open

### Domain Setup

- Domain: `tradeai.gonxt.tech`
- DNS A record pointing to `13.247.139.75`
- SSL certificate via Let's Encrypt

## Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Download and run the deployment script
wget https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/aws/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

### Option 2: Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/Reshigan/trade-ai-platform-v2.git
   cd trade-ai-platform-v2
   ```

2. **Install Docker and Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Set up environment**
   ```bash
   cp .env.production .env
   # Edit .env file with your specific configuration
   ```

4. **Deploy the application**
   ```bash
   sudo docker-compose -f docker-compose.production.yml up -d
   ```

5. **Seed the database**
   ```bash
   docker exec trade-ai-mongodb-prod mongosh trade-ai --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123 /seed/seed-gonxt-data.js
   ```

## Configuration

### Environment Variables

Key environment variables in `.env.production`:

```bash
# Database
MONGO_USERNAME=tradeai_admin
MONGO_PASSWORD=TradeAI_Mongo_2024_Secure_Password_123
MONGO_DATABASE=trade-ai

# Security
JWT_SECRET=TradeAI_JWT_Production_Secret_Key_2024_Extremely_Secure_And_Long_789
BCRYPT_SALT_ROUNDS=12

# Application
NODE_ENV=production
CORS_ORIGIN=https://tradeai.gonxt.tech
FRONTEND_URL=https://tradeai.gonxt.tech
API_BASE_URL=https://tradeai.gonxt.tech/api

# Multi-tenant
ENABLE_MULTI_TENANT=true
DEFAULT_COMPANY_DOMAIN=gonxt.tech
```

### SSL Configuration

SSL certificates are automatically obtained via Let's Encrypt:

```bash
# Manual certificate generation (if needed)
sudo certbot certonly --standalone -d tradeai.gonxt.tech --email admin@gonxt.tech
```

### Nginx Configuration

The Nginx configuration includes:
- SSL termination
- Rate limiting
- Security headers
- Reverse proxy to backend services
- Static file serving with caching

## Services

### Container Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy and SSL termination |
| frontend | 3001 | React application |
| backend | 5001 | Node.js API server |
| mongodb | 27017 | MongoDB database |
| redis | 6379 | Redis cache |
| ai-services | 8000 | AI/ML prediction services |
| monitoring | 8081 | System monitoring |

### System Services

```bash
# Application service
sudo systemctl start trade-ai
sudo systemctl stop trade-ai
sudo systemctl restart trade-ai
sudo systemctl status trade-ai

# Individual containers
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f [service]
```

## Data Management

### Database Seeding

The deployment includes comprehensive seed data:

- **GONXT Company**: 2 years of detailed business data (2023-2024)
- **Test Company**: Sample data for demonstrations
- **Users**: Admin and demo accounts
- **Customers**: 50 realistic customer records
- **Products**: 100 products across multiple categories
- **Sales Data**: 20,000 sales transactions
- **Trade Spends**: 5,000 trade spend records
- **Promotions**: 200 promotional campaigns

### Login Credentials

**GONXT Company:**
- Email: `admin@gonxt.tech`
- Password: `password123`
- Role: Admin

**Test Company:**
- Email: `demo@testcompany.demo`
- Password: `password123`
- Role: Admin

### Backup and Recovery

**Automated Backups:**
- Daily backups at 2:00 AM
- 30-day retention policy
- Includes MongoDB data, application files, and logs

**Manual Backup:**
```bash
sudo /opt/scripts/backup-trade-ai.sh
```

**Restore from Backup:**
```bash
# Stop services
sudo systemctl stop trade-ai

# Restore MongoDB
docker exec trade-ai-mongodb-prod mongorestore --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123 /backups/[backup-date]/mongodb

# Restore application files
sudo tar -xzf /opt/backups/trade-ai/[backup-date]/app-files.tar.gz -C /opt/trade-ai-platform-v2

# Start services
sudo systemctl start trade-ai
```

## Monitoring

### Health Checks

- **Application Health**: `https://tradeai.gonxt.tech/health`
- **API Health**: `https://tradeai.gonxt.tech/api/health`
- **Database Health**: Automatic container health checks

### System Monitoring

**Automated Monitoring:**
- Container health checks every 5 minutes
- Disk space monitoring (alert at 85%)
- Memory usage monitoring (alert at 85%)
- Service restart on failure

**Manual Monitoring:**
```bash
# Check all services
docker-compose -f /opt/trade-ai-platform-v2/docker-compose.production.yml ps

# View logs
docker-compose -f /opt/trade-ai-platform-v2/docker-compose.production.yml logs -f

# System resources
htop
df -h
free -h
```

### Log Management

**Log Locations:**
- Application logs: `/var/log/trade-ai/`
- Nginx logs: `/var/log/nginx/`
- Container logs: `docker logs [container-name]`

**Log Rotation:**
- Daily rotation
- 30-day retention
- Compressed archives

## Security

### Firewall Configuration

```bash
# UFW firewall rules
sudo ufw status
# Should show:
# 22/tcp (SSH)
# 80/tcp (HTTP)
# 443/tcp (HTTPS)
```

### Fail2Ban Protection

- SSH brute force protection
- HTTP authentication failure protection
- Nginx rate limiting protection

### SSL/TLS

- Let's Encrypt certificates
- Automatic renewal
- Strong cipher suites
- HSTS headers

## Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check Docker daemon
sudo systemctl status docker

# Check container logs
docker-compose -f docker-compose.production.yml logs [service]

# Restart services
sudo systemctl restart trade-ai
```

**Database connection issues:**
```bash
# Check MongoDB container
docker exec -it trade-ai-mongodb-prod mongosh --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123

# Check network connectivity
docker network ls
docker network inspect trade-ai-platform-v2_trade-ai-network
```

**SSL certificate issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Performance Optimization

**Database Optimization:**
- Indexes are automatically created during seeding
- Connection pooling configured
- Query optimization enabled

**Application Optimization:**
- Production builds with minification
- Static file caching
- Gzip compression
- CDN-ready headers

**System Optimization:**
- Docker resource limits
- Nginx worker processes
- Log rotation
- Automated cleanup

## Maintenance

### Regular Tasks

**Daily:**
- Automated backups
- Log rotation
- Health checks

**Weekly:**
- System updates
- Certificate renewal check
- Performance monitoring

**Monthly:**
- Security updates
- Backup verification
- Capacity planning

### Update Procedure

```bash
# 1. Backup current deployment
sudo /opt/scripts/backup-trade-ai.sh

# 2. Pull latest code
cd /opt/trade-ai-platform-v2
sudo git pull origin main

# 3. Rebuild and restart
sudo docker-compose -f docker-compose.production.yml build --no-cache
sudo docker-compose -f docker-compose.production.yml up -d

# 4. Verify deployment
curl -f https://tradeai.gonxt.tech/health
```

## Support

### Contact Information

- **Technical Support**: admin@gonxt.tech
- **Repository**: https://github.com/Reshigan/trade-ai-platform-v2
- **Documentation**: https://github.com/Reshigan/trade-ai-platform-v2/wiki

### Emergency Procedures

**Service Outage:**
1. Check system status: `sudo systemctl status trade-ai`
2. Check container status: `docker ps`
3. Review logs: `docker-compose logs -f`
4. Restart services: `sudo systemctl restart trade-ai`
5. Contact support if issues persist

**Data Recovery:**
1. Stop services: `sudo systemctl stop trade-ai`
2. Restore from latest backup
3. Verify data integrity
4. Start services: `sudo systemctl start trade-ai`
5. Test application functionality

## Appendix

### File Structure

```
/opt/trade-ai-platform-v2/
├── backend/                 # Node.js API server
├── frontend/               # React application
├── ai-services/           # AI/ML services
├── monitoring/            # System monitoring
├── nginx/                 # Nginx configuration
├── mongodb/               # Database initialization and seed data
├── deployment/            # Deployment scripts and documentation
├── docker-compose.production.yml
├── .env.production
└── README.md

/opt/backups/trade-ai/     # Backup storage
/var/log/trade-ai/         # Application logs
/opt/scripts/              # Management scripts
```

### Port Mapping

| Internal Port | External Port | Service |
|---------------|---------------|---------|
| 80 | 80 | Nginx HTTP |
| 443 | 443 | Nginx HTTPS |
| 5000 | 5001 | Backend API |
| 80 | 3001 | Frontend |
| 27017 | 27017 | MongoDB |
| 6379 | 6379 | Redis |
| 8000 | 8000 | AI Services |
| 8080 | 8081 | Monitoring |

### Environment-Specific Settings

**Production:**
- Multi-tenant enabled
- SSL required
- Rate limiting active
- Monitoring enabled
- Backups automated

**Development:**
- Single tenant
- HTTP allowed
- Relaxed rate limits
- Debug logging
- Manual backups