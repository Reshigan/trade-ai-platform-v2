# Trade AI Platform - Production Deployment Guide

## Server Information
- **Server IP**: 13.247.139.75
- **Domain**: tradeai.gonxt.tech
- **Platform**: AWS EC2
- **OS**: Ubuntu/Linux

## Prerequisites

### System Requirements
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **Network**: Public IP with ports 80, 443, 22 accessible

### Required Software
- Docker (latest version)
- Docker Compose (latest version)
- Nginx (for reverse proxy)
- Certbot (for SSL certificates)
- Git (for code deployment)

## Quick Deployment (Recommended)

### Step 1: Clone Repository
```bash
# Clone the repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2

# Make deployment script executable
chmod +x deploy-simple.sh
```

### Step 2: Run Deployment Script
```bash
# Run the automated deployment script
sudo ./deploy-simple.sh
```

This script will:
- ✅ Check Docker installation
- ✅ Build all containers from scratch
- ✅ Start all services (MongoDB, Backend, Frontend)
- ✅ Wait for services to be healthy
- ✅ Test login functionality
- ✅ Create nginx configuration
- ✅ Display service status and URLs

### Step 3: Verify Deployment
After the script completes, verify the services:

```bash
# Check service status
docker compose -f docker-compose.simple.yml ps

# Test frontend
curl http://localhost:3000

# Test backend API
curl http://localhost:5001/api/health

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@testcompany.com","password":"password"}'
```

## Production Configuration

### Step 4: Configure Nginx Reverse Proxy
```bash
# Copy nginx configuration
sudo cp nginx-production.conf /etc/nginx/sites-available/tradeai.gonxt.tech

# Enable the site
sudo ln -s /etc/nginx/sites-available/tradeai.gonxt.tech /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 5: Configure SSL Certificates
```bash
# Install certbot if not already installed
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate for your domain
sudo certbot --nginx -d tradeai.gonxt.tech

# Verify SSL renewal
sudo certbot renew --dry-run
```

### Step 6: Configure DNS
Point your domain `tradeai.gonxt.tech` to your server IP `13.247.139.75`:
- Create an A record: `tradeai.gonxt.tech` → `13.247.139.75`
- Wait for DNS propagation (5-30 minutes)

### Step 7: Configure Firewall
```bash
# Install and configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Service Configuration

### Environment Variables
The production environment is configured in `.env.production`:
- **Domain**: tradeai.gonxt.tech
- **Database**: MongoDB with authentication
- **API**: Backend running on port 5000
- **Frontend**: React app with production build
- **Security**: JWT tokens, CORS, rate limiting

### Default User Accounts
The system comes with pre-configured test accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | superadmin@tradeai.com | password | Full system access |
| Admin | admin@testcompany.com | password | Administrative access |
| Manager | manager@testcompany.com | password | Management access |
| User | user@testcompany.com | password | Standard user access |

**⚠️ IMPORTANT**: Change these passwords immediately in production!

### Service Ports
- **Frontend**: http://localhost:3000 (internal)
- **Backend API**: http://localhost:5001 (internal)
- **MongoDB**: localhost:27017 (internal)
- **Nginx**: Port 80 (HTTP) and 443 (HTTPS) (external)

## Monitoring and Maintenance

### Health Checks
```bash
# Check all services
docker compose -f docker-compose.simple.yml ps

# View logs
docker compose -f docker-compose.simple.yml logs -f

# Check specific service logs
docker compose -f docker-compose.simple.yml logs backend
docker compose -f docker-compose.simple.yml logs frontend
docker compose -f docker-compose.simple.yml logs mongodb
```

### Service Management
```bash
# Restart all services
docker compose -f docker-compose.simple.yml restart

# Restart specific service
docker compose -f docker-compose.simple.yml restart backend

# Stop all services
docker compose -f docker-compose.simple.yml down

# Start services
docker compose -f docker-compose.simple.yml up -d
```

### Database Management
```bash
# Access MongoDB shell
docker compose -f docker-compose.simple.yml exec mongodb mongosh tradeai_production

# Create database backup
docker compose -f docker-compose.simple.yml exec mongodb mongodump --out /tmp/backup
docker cp $(docker compose -f docker-compose.simple.yml ps -q mongodb):/tmp/backup ./backup-$(date +%Y%m%d)
```

### Log Management
```bash
# View application logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Docker logs
docker compose -f docker-compose.simple.yml logs --tail=100 -f
```

## Security Considerations

### 1. Change Default Passwords
```bash
# Access MongoDB and update user passwords
docker compose -f docker-compose.simple.yml exec mongodb mongosh tradeai_production

# In MongoDB shell:
db.users.updateOne(
  {email: "superadmin@tradeai.com"}, 
  {$set: {password: "NEW_SECURE_PASSWORD_HASH"}}
)
```

### 2. Update Environment Variables
Edit `.env.production` and change:
- JWT secrets
- Database passwords
- Session secrets
- Any API keys

### 3. Configure Firewall Rules
```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Enable Fail2Ban
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check Docker daemon
sudo systemctl status docker

# Check container logs
docker compose -f docker-compose.simple.yml logs

# Rebuild containers
docker compose -f docker-compose.simple.yml build --no-cache
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
docker compose -f docker-compose.simple.yml exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker compose -f docker-compose.simple.yml logs mongodb
```

#### 3. Frontend Not Loading
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# Check frontend container
docker compose -f docker-compose.simple.yml logs frontend
```

#### 4. API Not Responding
```bash
# Check backend logs
docker compose -f docker-compose.simple.yml logs backend

# Test API directly
curl http://localhost:5001/api/health
```

### Performance Optimization

#### 1. Enable Gzip Compression
Already configured in nginx.conf

#### 2. Configure Caching
```bash
# Add to nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Database Optimization
```bash
# Create indexes in MongoDB
docker compose -f docker-compose.simple.yml exec mongodb mongosh tradeai_production

# In MongoDB shell:
db.users.createIndex({email: 1})
db.customers.createIndex({name: 1})
db.products.createIndex({name: 1})
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# Create backup script
cat > /usr/local/bin/trade-ai-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/trade-ai"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR/$DATE"

# Backup MongoDB
docker compose -f /opt/trade-ai-platform/docker-compose.simple.yml exec -T mongodb mongodump --out /tmp/backup
docker cp $(docker compose -f /opt/trade-ai-platform/docker-compose.simple.yml ps -q mongodb):/tmp/backup "$BACKUP_DIR/$DATE/mongodb"

# Backup application files
tar -czf "$BACKUP_DIR/$DATE/application.tar.gz" -C /opt/trade-ai-platform .

echo "Backup completed: $BACKUP_DIR/$DATE"
EOF

chmod +x /usr/local/bin/trade-ai-backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/trade-ai-backup.sh") | crontab -
```

## Scaling and High Availability

### Load Balancing
For high traffic, consider:
- Multiple backend instances
- Redis for session storage
- Database clustering
- CDN for static assets

### Monitoring
Consider implementing:
- Application monitoring (New Relic, DataDog)
- Log aggregation (ELK stack)
- Uptime monitoring
- Performance monitoring

## Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check logs, monitor disk space
2. **Monthly**: Update system packages, review security
3. **Quarterly**: Update application dependencies
4. **Annually**: Review and update SSL certificates

### Getting Help
- Check logs first: `docker compose -f docker-compose.simple.yml logs`
- Review this guide for common solutions
- Check GitHub issues for known problems

## Conclusion

This deployment guide provides a complete setup for the Trade AI Platform on AWS. The automated deployment script handles most of the complexity, but manual configuration of SSL, DNS, and security settings is required for production use.

**Key Success Factors:**
- ✅ All services running and healthy
- ✅ Login authentication working
- ✅ Frontend serving correctly
- ✅ Database populated with test data
- ✅ Nginx reverse proxy configured
- ✅ SSL certificates installed
- ✅ DNS pointing to server
- ✅ Firewall configured
- ✅ Monitoring in place

The platform is now ready for production use with proper security, monitoring, and backup procedures in place.