# Trade AI Platform - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Trade AI Platform to AWS production environment with multi-tenant architecture, complete data isolation, and enterprise-grade security.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Multi-Tenant Architecture](#multi-tenant-architecture)
4. [AWS Infrastructure Setup](#aws-infrastructure-setup)
5. [Production Deployment](#production-deployment)
6. [Data Seeding](#data-seeding)
7. [Security Configuration](#security-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

The Trade AI Platform is designed as a multi-tenant SaaS application with complete data isolation between companies:

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Production                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Nginx     │  │  Frontend   │  │   Backend   │         │
│  │ Load Balancer│  │    React    │  │   Node.js   │         │
│  │   SSL/TLS   │  │     SPA     │  │  Multi-Tenant│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                 │                 │               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ AI Services │  │ Monitoring  │  │   MongoDB   │         │
│  │   Python    │  │  Dashboard  │  │  Database   │         │
│  │   ML/AI     │  │   Metrics   │  │ Multi-Tenant│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                           │                 │
│                          ┌─────────────┐                   │
│                          │    Redis    │                   │
│                          │    Cache    │                   │
│                          │   Session   │                   │
│                          └─────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

- **Multi-Tenant Architecture**: Complete data isolation between companies
- **Scalable Infrastructure**: Docker-based microservices architecture
- **Enterprise Security**: SSL/TLS, rate limiting, security headers
- **High Availability**: Load balancing, health checks, auto-restart
- **Comprehensive Monitoring**: Real-time metrics and alerting
- **Automated Backups**: Daily backups with S3 integration

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04 LTS or later
- **CPU**: Minimum 4 cores (8 cores recommended)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: Minimum 100GB SSD
- **Network**: Static IP address, domain name configured

### Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install additional tools
sudo apt install -y git curl wget jq nginx certbot python3-certbot-nginx
```

### AWS Configuration

```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format

# Verify configuration
aws sts get-caller-identity
```

## Multi-Tenant Architecture

### Company Isolation

The platform implements complete data isolation using the following strategies:

1. **Database Level**: All models include a `company` field
2. **API Level**: Middleware ensures company-specific data access
3. **Authentication**: JWT tokens include company information
4. **Domain Routing**: Subdomain-based company routing

### Company Model Structure

```javascript
{
  name: "GONXT Technologies",
  code: "GONXT",
  domain: "gonxt.tech",
  subscription: {
    plan: "enterprise",
    status: "active",
    maxUsers: 100,
    maxCustomers: 5000,
    maxProducts: 10000
  },
  enabledModules: [
    { module: "customers", enabled: true, permissions: ["read", "write", "delete"] },
    { module: "products", enabled: true, permissions: ["read", "write", "delete"] },
    // ... more modules
  ]
}
```

### Data Models with Company Isolation

All data models include company association:

- **Users**: Belong to a specific company
- **Customers**: Company-specific customer data
- **Products**: Company-specific product catalog
- **Sales History**: Company-isolated transaction data
- **Campaigns**: Company-specific marketing campaigns
- **Budgets**: Company-specific budget allocations

## AWS Infrastructure Setup

### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (recommended: t3.large or larger)
# Configure security groups:
# - HTTP (80): 0.0.0.0/0
# - HTTPS (443): 0.0.0.0/0
# - SSH (22): Your IP only
# - Custom TCP (8080): Your IP only (monitoring)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Domain Configuration

```bash
# Configure DNS records
# A record: tradeai.gonxt.tech -> Your EC2 IP
# A record: *.tradeai.gonxt.tech -> Your EC2 IP (for subdomains)
```

### 3. SSL Certificate Setup

```bash
# Install Certbot and obtain SSL certificate
sudo certbot --nginx -d tradeai.gonxt.tech -d *.tradeai.gonxt.tech
```

### 4. S3 Buckets Setup

```bash
# Create S3 buckets for backups and logs
aws s3 mb s3://tradeai-backups-prod
aws s3 mb s3://tradeai-logs-prod

# Configure bucket policies for security
```

## Production Deployment

### 1. Clone Repository

```bash
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2
```

### 2. Configure Environment

```bash
# Copy and edit production environment file
cp .env.production.example .env.production
nano .env.production

# Update the following critical variables:
# - MONGO_PASSWORD
# - JWT_SECRET
# - REDIS_PASSWORD
# - AWS credentials
# - Domain configuration
```

### 3. Run Deployment Script

```bash
# Make deployment script executable
chmod +x scripts/deploy-aws-production.sh

# Run deployment (with all checks)
./scripts/deploy-aws-production.sh

# Or with specific options:
./scripts/deploy-aws-production.sh --skip-backup --force-rebuild
```

### 4. Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Create data directories
sudo mkdir -p /opt/trade-ai/{data,logs,backups,ssl}
sudo mkdir -p /opt/trade-ai/data/{mongodb,redis,ai-models,monitoring}
sudo chown -R $USER:$USER /opt/trade-ai

# 2. Build Docker images
docker-compose -f docker-compose.aws-production.yml build

# 3. Start services
docker-compose -f docker-compose.aws-production.yml up -d

# 4. Check service status
docker-compose -f docker-compose.aws-production.yml ps
```

## Data Seeding

### GONXT Production Data

The platform includes comprehensive production data for GONXT:

```bash
# Seed GONXT production data (2 years of trading data)
docker exec trade-ai-backend-aws-prod node src/seeds/gonxt-production-seed.js
```

### Data Includes:

- **Companies**: GONXT Technologies + Test Company
- **Users**: 10+ users with different roles (Admin, Directors, KAMs, Sales Reps)
- **Products**: 500+ products across multiple categories
- **Customers**: 200+ customers across different tiers and channels
- **Sales History**: 2 years of detailed transaction data
- **Trade Spend**: Marketing and promotional spend records
- **Campaigns**: Quarterly campaigns with promotions
- **Budgets**: Annual budget allocations

### Test Company Access

- **URL**: https://test.tradeai.gonxt.tech
- **Admin**: admin@test.demo / Test123!@#
- **Manager**: manager@test.demo / Test123!@#

### GONXT Company Access

- **URL**: https://tradeai.gonxt.tech
- **Admin**: admin@gonxt.tech / Admin123!@#
- **Sales Director**: sales.director@gonxt.tech / Sales123!@#
- **KAM**: michael.chen@gonxt.tech / Kam123!@#

## Security Configuration

### 1. Nginx Security

The production nginx configuration includes:

- **SSL/TLS**: Strong cipher suites, HSTS headers
- **Rate Limiting**: API and authentication endpoint protection
- **Security Headers**: XSS protection, content type sniffing prevention
- **IP Whitelisting**: Monitoring endpoints restricted to internal IPs

### 2. Application Security

- **JWT Authentication**: Secure token-based authentication
- **Company Isolation**: Middleware ensures data isolation
- **Input Validation**: Comprehensive input sanitization
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Redis-based session storage

### 3. Database Security

- **Authentication**: MongoDB with username/password
- **Network Isolation**: Database accessible only within Docker network
- **Backup Encryption**: Encrypted backups stored in S3

### 4. Container Security

- **Non-root Users**: All containers run as non-root users
- **Resource Limits**: CPU and memory limits configured
- **Health Checks**: Comprehensive health monitoring
- **Security Scanning**: Regular vulnerability scans

## Monitoring & Logging

### 1. Application Monitoring

Access monitoring dashboard at: `https://tradeai.gonxt.tech/monitoring`

Features:
- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: API response times, error rates
- **Database Metrics**: Connection pool, query performance
- **Business Metrics**: User activity, transaction volumes

### 2. Log Management

Logs are centralized and rotated:

```bash
# View application logs
docker-compose -f docker-compose.aws-production.yml logs -f backend

# View nginx logs
tail -f /opt/trade-ai/logs/nginx/access.log

# View system logs
journalctl -u docker -f
```

### 3. Alerting

Configure alerts for:
- **Service Downtime**: Automatic notifications
- **High Error Rates**: API error threshold alerts
- **Resource Usage**: CPU/Memory threshold alerts
- **Security Events**: Failed login attempts, suspicious activity

## Backup & Recovery

### 1. Automated Backups

Daily backups are configured for:

- **MongoDB**: Full database dumps
- **Redis**: RDB snapshots
- **Application Data**: File system backups
- **Configuration**: Environment and config files

### 2. Backup Storage

Backups are stored in:
- **Local**: `/opt/trade-ai/backups` (7 days retention)
- **S3**: `s3://tradeai-backups-prod` (30 days retention)

### 3. Recovery Procedures

```bash
# Restore from backup
./scripts/restore-backup.sh --date=20240115 --source=s3

# Manual MongoDB restore
docker exec -i trade-ai-mongodb-aws-prod mongorestore \
  --username="$MONGO_USERNAME" \
  --password="$MONGO_PASSWORD" \
  --authenticationDatabase=admin \
  /backups/mongodb-20240115
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check service status
docker-compose -f docker-compose.aws-production.yml ps

# Check logs
docker-compose -f docker-compose.aws-production.yml logs service-name

# Restart specific service
docker-compose -f docker-compose.aws-production.yml restart service-name
```

#### 2. Database Connection Issues

```bash
# Check MongoDB status
docker exec trade-ai-mongodb-aws-prod mongosh \
  --username="$MONGO_USERNAME" \
  --password="$MONGO_PASSWORD" \
  --eval "db.adminCommand('ping')"

# Check network connectivity
docker network ls
docker network inspect trade-ai-platform-v2_trade-ai-network
```

#### 3. SSL Certificate Issues

```bash
# Renew SSL certificate
sudo certbot renew --nginx

# Check certificate status
sudo certbot certificates
```

#### 4. Performance Issues

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h

# Optimize database
docker exec trade-ai-mongodb-aws-prod mongosh \
  --username="$MONGO_USERNAME" \
  --password="$MONGO_PASSWORD" \
  --eval "db.runCommand({compact: 'collection_name'})"
```

### Health Check Endpoints

- **Application**: `https://tradeai.gonxt.tech/health`
- **API**: `https://tradeai.gonxt.tech/api/health`
- **Database**: Internal health checks
- **Monitoring**: `https://tradeai.gonxt.tech/monitoring/health`

### Support Contacts

- **Technical Support**: admin@gonxt.tech
- **Emergency Contact**: +61-2-9876-5432
- **Documentation**: https://docs.tradeai.gonxt.tech

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Review monitoring dashboards
   - Check backup integrity
   - Update security patches

2. **Monthly**:
   - Review access logs
   - Update SSL certificates (if needed)
   - Performance optimization

3. **Quarterly**:
   - Security audit
   - Disaster recovery testing
   - Capacity planning review

### Scaling Considerations

For scaling the platform:

1. **Horizontal Scaling**: Add more backend/frontend containers
2. **Database Scaling**: MongoDB replica sets or sharding
3. **Load Balancing**: Multiple nginx instances with AWS ALB
4. **Caching**: Redis cluster for high availability
5. **CDN**: CloudFront for static asset delivery

---

**Last Updated**: January 15, 2024  
**Version**: 2.0.0  
**Environment**: AWS Production