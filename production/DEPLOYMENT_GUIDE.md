# Trade AI Platform - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Trade AI Platform in a production environment. The platform includes a React frontend, Node.js backend, MongoDB database, Redis cache, AI services, and monitoring components.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Requirements](#server-requirements)
3. [Pre-Deployment Setup](#pre-deployment-setup)
4. [Quick Deployment](#quick-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Backup & Recovery](#backup--recovery)

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **OpenSSL**: For generating certificates and secrets
- **Nginx**: (Optional, if not using Docker nginx)

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **CPU**: Minimum 4 cores, Recommended 8+ cores
- **Storage**: Minimum 100GB SSD, Recommended 500GB+ SSD
- **Network**: Static IP address, Domain name configured

## Server Requirements

### Minimum Production Server Specs
```
CPU: 4 vCPUs
RAM: 8GB
Storage: 100GB SSD
Network: 1Gbps
OS: Ubuntu 22.04 LTS
```

### Recommended Production Server Specs
```
CPU: 8+ vCPUs
RAM: 16GB+
Storage: 500GB+ SSD
Network: 1Gbps+
OS: Ubuntu 22.04 LTS
```

### Port Requirements
```
80    - HTTP (redirects to HTTPS)
443   - HTTPS (main application)
22    - SSH (for administration)
3000  - Frontend (internal)
5000  - Backend API (internal)
6379  - Redis (internal)
8000  - AI Services (internal)
8080  - Monitoring (internal)
27017 - MongoDB (internal)
```

## Pre-Deployment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git openssl ufw fail2ban

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply Docker group membership
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Domain Configuration

Ensure your domain is pointing to your server's IP address:
```
A Record: yourdomain.com -> YOUR_SERVER_IP
A Record: www.yourdomain.com -> YOUR_SERVER_IP
```

### 4. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2

# Switch to main branch (if not already)
git checkout main
```

## Quick Deployment

### Automated Deployment (Recommended)

```bash
# Navigate to production directory
cd production

# Run the automated deployment script
./deploy.sh
```

The deployment script will:
1. Check system requirements
2. Generate secure passwords automatically
3. Configure domain settings
4. Generate SSL certificates
5. Deploy all services
6. Initialize the database
7. Provide access information

## Manual Deployment

### 1. Environment Configuration

```bash
cd production

# Copy and edit environment files
cp .env.production .env.production.local
cp .env.frontend.production .env.frontend.production.local

# Edit the files with your specific configuration
nano .env.production.local
nano .env.frontend.production.local
```

### 2. Update Configuration Files

#### Backend Environment (.env.production.local)
```bash
# Update these critical values:
MONGO_PASSWORD=your_secure_mongo_password
REDIS_PASSWORD=your_secure_redis_password
JWT_SECRET=your_extremely_secure_jwt_secret_64_chars_minimum
JWT_REFRESH_SECRET=your_extremely_secure_refresh_secret_64_chars_minimum
SESSION_SECRET=your_extremely_secure_session_secret_64_chars_minimum

# Update domain
CORS_ORIGIN=https://yourdomain.com
CLIENT_URL=https://yourdomain.com

# Update email settings
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=your-smtp-server.com
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

#### Frontend Environment (.env.frontend.production.local)
```bash
# Update API URLs
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_SOCKET_URL=https://yourdomain.com
REACT_APP_AI_API_URL=https://yourdomain.com/ai
REACT_APP_MONITORING_URL=https://yourdomain.com/monitoring
```

### 3. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to production directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

#### Option B: Self-Signed (Development/Testing)
```bash
# Generate self-signed certificates
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
    -subj "/C=AU/ST=NSW/L=Sydney/O=YourCompany/CN=yourdomain.com"
```

### 4. Deploy Services

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### 5. Initialize Database

```bash
# Wait for MongoDB to be ready (about 30 seconds)
sleep 30

# Run the production seed script
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_mongo_password" \
    /docker-entrypoint-initdb.d/seed-production-data.js
```

## Post-Deployment Configuration

### 1. Verify Deployment

```bash
# Check all services are running
docker ps

# Test API endpoint
curl -k https://yourdomain.com/api/health

# Test frontend
curl -k https://yourdomain.com
```

### 2. Initial Login

1. Open https://yourdomain.com in your browser
2. Login with any of the test accounts:
   - **Super Admin**: `superadmin@gonxt.tech` / `password123`
   - **Admin**: `admin@gonxt.tech` / `password123`
   - **Manager**: `manager@gonxt.tech` / `password123`

### 3. Change Default Passwords

**CRITICAL**: Change all default passwords immediately:

1. Login as Super Admin
2. Go to User Management
3. Update passwords for all test accounts
4. Create your actual production users
5. Disable or delete test accounts as needed

### 4. Configure Email Settings

1. Login as Admin
2. Go to System Settings
3. Configure SMTP settings
4. Test email functionality

### 5. Set Up Monitoring

1. Access monitoring dashboard: https://yourdomain.com/monitoring
2. Configure alert thresholds
3. Set up notification channels
4. Test monitoring alerts

## Security Hardening

### 1. System Security

```bash
# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Disable root SSH login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Application Security

```bash
# Update all environment secrets
# Generate new JWT secrets
openssl rand -base64 64

# Generate new session secrets
openssl rand -base64 32

# Update database passwords
# Update Redis passwords
```

### 3. Network Security

```bash
# Configure additional firewall rules
sudo ufw deny 27017  # Block external MongoDB access
sudo ufw deny 6379   # Block external Redis access
sudo ufw deny 3000   # Block direct frontend access
sudo ufw deny 5000   # Block direct backend access
```

### 4. SSL/TLS Configuration

Ensure strong SSL configuration in nginx:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Monitoring & Maintenance

### 1. Health Checks

```bash
# Check service health
docker-compose -f docker-compose.production.yml ps

# Check resource usage
docker stats

# Check logs
docker-compose -f docker-compose.production.yml logs --tail=100
```

### 2. Log Management

```bash
# View application logs
docker logs trade-ai-backend-prod --tail=100 -f
docker logs trade-ai-frontend-prod --tail=100 -f
docker logs trade-ai-mongodb-prod --tail=100 -f

# Log rotation is handled automatically by Docker
```

### 3. Performance Monitoring

- **CPU Usage**: Monitor via `htop` or monitoring dashboard
- **Memory Usage**: Check Docker stats and system memory
- **Disk Usage**: Monitor with `df -h` and database size
- **Network**: Monitor bandwidth and connection counts

### 4. Database Maintenance

```bash
# MongoDB maintenance
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --eval "db.runCommand({compact: 'users'})"

# Check database size
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --eval "db.stats()"
```

## Troubleshooting

### Common Issues

#### 1. Services Won't Start
```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs
docker-compose -f docker-compose.production.yml logs

# Restart services
docker-compose -f docker-compose.production.yml restart
```

#### 2. Database Connection Issues
```bash
# Check MongoDB logs
docker logs trade-ai-mongodb-prod

# Test connection
docker exec trade-ai-mongodb-prod mongosh --eval "db.adminCommand('ping')"

# Check authentication
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --eval "db.users.countDocuments()"
```

#### 3. Frontend Not Loading
```bash
# Check nginx logs
docker logs trade-ai-nginx-prod

# Check frontend build
docker logs trade-ai-frontend-prod

# Test API connectivity
curl -k https://yourdomain.com/api/health
```

#### 4. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443
```

### Performance Issues

#### High CPU Usage
```bash
# Check which container is using CPU
docker stats

# Scale services if needed
docker-compose -f docker-compose.production.yml up -d --scale trade-ai-backend=2
```

#### High Memory Usage
```bash
# Check memory usage per container
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Restart memory-heavy services
docker-compose -f docker-compose.production.yml restart trade-ai-backend
```

#### Database Performance
```bash
# Check slow queries
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --eval "db.setProfilingLevel(2, {slowms: 100})"

# Create indexes if needed
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --eval "db.users.createIndex({email: 1})"
```

## Backup & Recovery

### 1. Database Backup

```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec trade-ai-mongodb-prod mongodump \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --db trade_ai_production \
    --out /tmp/backup_$DATE

docker cp trade-ai-mongodb-prod:/tmp/backup_$DATE $BACKUP_DIR/
docker exec trade-ai-mongodb-prod rm -rf /tmp/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x backup-database.sh
```

### 2. Automated Backups

```bash
# Add to crontab for daily backups at 2 AM
echo "0 2 * * * /path/to/backup-database.sh" | crontab -
```

### 3. File Backups

```bash
# Backup uploaded files
docker run --rm -v trade-ai-platform-v2_backend_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### 4. Recovery Process

```bash
# Stop services
docker-compose -f docker-compose.production.yml down

# Restore database
docker-compose -f docker-compose.production.yml up -d trade-ai-mongodb
sleep 30

docker exec trade-ai-mongodb-prod mongorestore \
    --authenticationDatabase admin \
    -u tradeai_admin \
    -p "your_password" \
    --db trade_ai_production \
    /path/to/backup/trade_ai_production

# Start all services
docker-compose -f docker-compose.production.yml up -d
```

## Maintenance Tasks

### Daily Tasks
- [ ] Check service health
- [ ] Review error logs
- [ ] Monitor resource usage
- [ ] Verify backups completed

### Weekly Tasks
- [ ] Update system packages
- [ ] Review security logs
- [ ] Check disk space
- [ ] Test backup restoration
- [ ] Review user activity

### Monthly Tasks
- [ ] Update Docker images
- [ ] Review and rotate logs
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update SSL certificates (if needed)

## Support & Documentation

### Useful Commands

```bash
# View all services
docker-compose -f docker-compose.production.yml ps

# View logs for specific service
docker-compose -f docker-compose.production.yml logs -f trade-ai-backend

# Restart specific service
docker-compose -f docker-compose.production.yml restart trade-ai-backend

# Update services
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Clean up unused resources
docker system prune -f

# Export/Import data
docker exec trade-ai-mongodb-prod mongoexport --db trade_ai_production --collection users --out /tmp/users.json
```

### Configuration Files Location
- Environment: `/production/.env.production`
- Frontend Config: `/production/.env.frontend.production`
- Docker Compose: `/production/docker-compose.production.yml`
- SSL Certificates: `/production/ssl/`
- Logs: `/production/logs/`

### Default Test Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Super Admin | superadmin@gonxt.tech | password123 | All system access |
| Admin | admin@gonxt.tech | password123 | Full platform access |
| Manager | manager@gonxt.tech | password123 | Team management |
| KAM | kam@gonxt.tech | password123 | Key account management |
| Analyst | analyst@gonxt.tech | password123 | Analytics and reporting |
| Finance | finance@gonxt.tech | password123 | Financial management |
| Sales Rep | sales@gonxt.tech | password123 | Sales activities |
| Viewer | viewer@gonxt.tech | password123 | Read-only access |

**⚠️ SECURITY WARNING**: Change all default passwords immediately after deployment!

---

## Conclusion

This deployment guide provides comprehensive instructions for setting up the Trade AI Platform in production. Follow the security hardening steps carefully and ensure regular maintenance for optimal performance and security.

For additional support or questions, please refer to the project documentation or contact the development team.