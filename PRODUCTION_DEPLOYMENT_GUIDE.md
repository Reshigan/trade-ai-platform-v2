# Trade AI Platform v2 - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Trade AI Platform v2 in a production AWS environment with full multi-tenant support, advanced analytics features, and enterprise-grade security.

## Architecture

The production deployment includes:

- **Frontend**: React application with production optimizations
- **Backend**: Node.js API with multi-tenant architecture
- **Database**: MongoDB 7.0 with production configuration
- **Cache**: Redis for session management and caching
- **AI Services**: Local ML models for analytics and predictions
- **Monitoring**: Real-time system monitoring and alerting
- **Nginx**: Reverse proxy with SSL termination and rate limiting
- **Backup**: Automated backup system with AWS S3 integration

## Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or later
- Minimum 4GB RAM (8GB recommended)
- Minimum 50GB disk space (100GB recommended)
- Root or sudo access

### DNS Configuration
Before deployment, ensure your DNS records are configured:
```
A Record: tradeai.gonxt.tech → 13.247.139.75
A Record: www.tradeai.gonxt.tech → 13.247.139.75
```

### Required Information
- OpenAI API Key (for AI services)
- Email address for SSL certificate registration

## Quick Deployment

### 1. Clone Repository
```bash
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2
```

### 2. Configure Environment
Edit the production environment file:
```bash
nano .env.production
```

**Important**: Update the following variables:
- `AI_MODEL_API_KEY`: Your OpenAI API key
- `SSL_EMAIL`: Your email for SSL certificate registration
- Change default passwords for security

### 3. Run Deployment Script
```bash
sudo ./deploy-production.sh
```

This script will:
- Install all system dependencies
- Configure Docker and Docker Compose
- Set up firewall and security
- Generate SSL certificates
- Deploy all services
- Configure monitoring and backups

### 4. Verify Deployment
After deployment, verify services are running:
```bash
./scripts/manage-production.sh health
```

Access your platform at: https://tradeai.gonxt.tech

## Manual Deployment Steps

If you prefer manual deployment or need to troubleshoot:

### 1. System Setup
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

### 2. SSL Certificate Setup
```bash
sudo ./scripts/setup-ssl.sh
```

### 3. Deploy Services
```bash
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

## Service Architecture

### Services Overview
- **MongoDB**: Database (Port 27017, internal only)
- **Redis**: Cache and sessions (Port 6379, internal only)
- **Backend**: Node.js API (Port 5001, internal only)
- **Frontend**: React application (Port 3001, internal only)
- **AI Services**: Python AI/ML services (Port 8000, internal only)
- **Monitoring**: System monitoring (Port 8081, internal only)
- **Nginx**: Reverse proxy and SSL termination (Ports 80, 443)

### Network Security
- All internal services are bound to localhost only
- Only Nginx exposes ports 80 and 443 to the internet
- Firewall configured to allow only necessary ports
- Fail2Ban configured for intrusion prevention

## Management Commands

Use the management script for common operations:

```bash
# Start all services
./scripts/manage-production.sh start

# Stop all services
./scripts/manage-production.sh stop

# Restart services
./scripts/manage-production.sh restart

# Check service status
./scripts/manage-production.sh status

# View logs
./scripts/manage-production.sh logs [service_name]

# Check health
./scripts/manage-production.sh health

# Create backup
./scripts/manage-production.sh backup

# Update services
./scripts/manage-production.sh update

# Clean up system
./scripts/manage-production.sh cleanup

# Renew SSL certificates
./scripts/manage-production.sh ssl-renew

# Show monitoring info
./scripts/manage-production.sh monitor
```

## Configuration Files

### Environment Configuration
- `.env.production`: Production environment variables
- `docker-compose.production.yml`: Production Docker Compose configuration

### Web Server Configuration
- `nginx.conf`: Nginx reverse proxy configuration
- `ssl/`: SSL certificates directory

### Scripts
- `deploy-production.sh`: Main deployment script
- `scripts/setup-ssl.sh`: SSL certificate setup
- `scripts/manage-production.sh`: Production management utilities
- `scripts/logrotate.conf`: Log rotation configuration

## Security Features

### Network Security
- UFW firewall configured
- Fail2Ban intrusion prevention
- Services bound to localhost only
- Docker network isolation

### SSL/TLS Security
- Let's Encrypt SSL certificates
- TLS 1.2+ only
- Strong cipher suites
- HSTS headers
- Security headers (CSP, X-Frame-Options, etc.)

### Application Security
- JWT authentication
- Rate limiting
- Input validation
- Security logging
- Session management

### System Security
- Automatic security updates
- Log rotation
- Resource monitoring
- Backup automation

## Monitoring and Logging

### Log Locations
- Application logs: `logs/`
- Nginx logs: `logs/nginx/`
- System logs: `/var/log/tradeai-*.log`

### Monitoring
- Container health checks
- System resource monitoring
- Service availability monitoring
- Automated alerting (via logs)

### Backups
- Automated daily backups at 2 AM
- MongoDB and Redis data backup
- Application data backup
- 30-day retention policy

## Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs [service_name]

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service_name]
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Restart nginx after certificate renewal
docker-compose -f docker-compose.production.yml restart nginx
```

#### Database Connection Issues
```bash
# Check MongoDB logs
docker logs trade-ai-mongodb-prod

# Connect to MongoDB shell
docker exec -it trade-ai-mongodb-prod mongosh -u tradeai_admin -p

# Check Redis
docker exec -it trade-ai-redis-prod redis-cli -a "your_redis_password"
```

#### Performance Issues
```bash
# Check system resources
./scripts/manage-production.sh monitor

# Check container resources
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

### Log Analysis
```bash
# Check error logs
grep -r "ERROR" logs/

# Check recent activity
tail -f logs/backend/app.log

# Check nginx access logs
tail -f logs/nginx/access.log

# Check system monitoring
tail -f /var/log/tradeai-monitor.log
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Automated backups (configured via cron)
- Log rotation (automated)
- Health monitoring (automated)

#### Weekly
- Review system logs
- Check disk space usage
- Verify backup integrity

#### Monthly
- Update system packages
- Review security logs
- Performance optimization
- SSL certificate renewal (automated)

### Update Procedure
```bash
# 1. Backup current state
./scripts/manage-production.sh backup

# 2. Pull latest code
git pull

# 3. Update services
./scripts/manage-production.sh update

# 4. Verify deployment
./scripts/manage-production.sh health
```

## Performance Optimization

### System Optimization
- Docker resource limits configured
- Nginx caching enabled
- Gzip compression enabled
- Static file caching
- Database connection pooling

### Monitoring Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Response times
- Error rates

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database clustering
- Redis clustering
- Container orchestration (Kubernetes)

### Vertical Scaling
- Increase server resources
- Optimize container resource limits
- Database performance tuning

## Support and Maintenance

### Contact Information
- System Administrator: admin@gonxt.tech
- Technical Support: support@gonxt.tech

### Documentation
- API Documentation: https://tradeai.gonxt.tech/api/docs
- User Guide: https://tradeai.gonxt.tech/docs
- System Status: https://tradeai.gonxt.tech/monitoring

### Emergency Procedures
1. Check service status: `./scripts/manage-production.sh health`
2. Review logs: `./scripts/manage-production.sh logs`
3. Restart services if needed: `./scripts/manage-production.sh restart`
4. Contact support if issues persist

---

## Quick Reference

### Service URLs
- Main Application: https://tradeai.gonxt.tech
- API Endpoint: https://tradeai.gonxt.tech/api
- AI Services: https://tradeai.gonxt.tech/ai
- Monitoring: https://tradeai.gonxt.tech/monitoring

### Important Files
- Environment: `.env.production`
- Docker Compose: `docker-compose.production.yml`
- Nginx Config: `nginx.conf`
- SSL Certificates: `ssl/`
- Logs: `logs/`
- Backups: `backups/`

### Key Commands
```bash
# Deploy
sudo ./deploy-production.sh

# Manage
./scripts/manage-production.sh [command]

# Monitor
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f
```

This deployment is production-ready with enterprise-grade security, monitoring, and maintenance features.