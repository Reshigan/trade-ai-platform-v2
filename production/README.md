# Trade AI Platform - Production Deployment Package

## 🚀 Quick Start

This production package contains everything needed for a clean, secure deployment of the Trade AI Platform.

### One-Command Deployment
```bash
cd production
./deploy.sh
```

## 📁 Package Contents

### Configuration Files
- **`.env.production`** - Backend production environment variables
- **`.env.frontend.production`** - Frontend production environment variables
- **`docker-compose.production.yml`** - Production Docker Compose configuration

### Deployment Scripts
- **`deploy.sh`** - Automated production deployment script
- **`clean-for-production.sh`** - Script to remove development/test data

### Database & Seeding
- **`seed-production-data.js`** - Production database seed script with GONXT company and test accounts

### Documentation
- **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment instructions
- **`SECURITY_CHECKLIST.md`** - Production security checklist
- **`README.md`** - This file

## 🏢 GONXT Company Setup

The platform is pre-configured for GONXT company with the following test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Super Admin** | superadmin@gonxt.tech | password123 | Full system access |
| **Admin** | admin@gonxt.tech | password123 | Platform administration |
| **Manager** | manager@gonxt.tech | password123 | Team and budget management |
| **KAM** | kam@gonxt.tech | password123 | Key Account Manager |
| **Analyst** | analyst@gonxt.tech | password123 | Analytics and reporting |
| **Finance** | finance@gonxt.tech | password123 | Financial management |
| **Sales Rep** | sales@gonxt.tech | password123 | Sales activities |
| **Viewer** | viewer@gonxt.tech | password123 | Read-only access |

**⚠️ CRITICAL**: Change all default passwords immediately after deployment!

## 🛡️ Security Features

### Pre-Configured Security
- ✅ JWT authentication with secure tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Multi-tenant company isolation
- ✅ HTTPS/SSL encryption
- ✅ Database authentication
- ✅ Redis password protection
- ✅ CORS configuration
- ✅ Security headers
- ✅ Rate limiting
- ✅ Input validation
- ✅ Audit logging

### Production Hardening
- 🔒 No mock or test data included
- 🔒 Development endpoints disabled
- 🔒 Debug logging disabled
- 🔒 Source maps disabled
- 🔒 Secure cookie settings
- 🔒 Production error handling

## 🏗️ Architecture

### Services Included
- **Frontend**: React application with Nginx
- **Backend**: Node.js API server
- **Database**: MongoDB with authentication
- **Cache**: Redis with password protection
- **AI Services**: Machine learning and analytics
- **Monitoring**: System health and performance monitoring
- **Reverse Proxy**: Nginx with SSL termination

### Network Architecture
```
Internet → Nginx (SSL) → Frontend/Backend → MongoDB/Redis
                      → AI Services
                      → Monitoring
```

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: 8GB minimum, 16GB+ recommended
- **CPU**: 4 cores minimum, 8+ cores recommended
- **Storage**: 100GB SSD minimum, 500GB+ recommended
- **Network**: Static IP, domain name configured

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
# Clone repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2/production

# Run automated deployment
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Configure environment
cp .env.production .env.production.local
nano .env.production.local

# 2. Update domain and passwords
# 3. Set up SSL certificates
# 4. Deploy services
docker-compose -f docker-compose.production.yml up -d --build

# 5. Initialize database
docker exec trade-ai-mongodb-prod mongosh trade_ai_production \
    --authenticationDatabase admin \
    -u tradeai_admin -p "your_password" \
    /docker-entrypoint-initdb.d/seed-production-data.js
```

## 🔧 Configuration

### Required Updates Before Deployment

1. **Update Domain**:
   ```bash
   # Replace 'your-domain.com' with your actual domain
   sed -i 's/your-domain.com/yourdomain.com/g' .env.production
   sed -i 's/your-domain.com/yourdomain.com/g' .env.frontend.production
   ```

2. **Generate Secure Passwords**:
   ```bash
   # MongoDB password
   openssl rand -base64 32

   # Redis password
   openssl rand -base64 32

   # JWT secrets (64+ characters)
   openssl rand -base64 64
   ```

3. **Configure SMTP** (Update in `.env.production`):
   ```
   SMTP_HOST=your-smtp-server.com
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   ```

## 📊 Initial Data

### GONXT Company Profile
- **Name**: GONXT
- **Domain**: gonxt.tech
- **Currency**: AUD (Australian Dollar)
- **Timezone**: Australia/Sydney
- **Initial Budget**: $1,000,000 AUD for current year

### Budget Categories
- Trade Marketing: $400,000 (40%)
- Consumer Promotions: $250,000 (25%)
- Retailer Support: $200,000 (20%)
- Digital Marketing: $100,000 (10%)
- Events & Sponsorship: $50,000 (5%)

## 🔍 Health Checks

### Service Status
```bash
# Check all services
docker-compose -f docker-compose.production.yml ps

# Check specific service health
curl -k https://yourdomain.com/api/health
```

### Log Monitoring
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker logs trade-ai-backend-prod -f
```

## 🛠️ Maintenance

### Daily Tasks
- Monitor service health
- Check error logs
- Verify backup completion

### Weekly Tasks
- Update system packages
- Review security logs
- Check disk space usage

### Monthly Tasks
- Update Docker images
- Security audit
- Performance optimization
- SSL certificate renewal check

## 🆘 Troubleshooting

### Common Issues

1. **Services won't start**:
   ```bash
   docker-compose -f docker-compose.production.yml logs
   ```

2. **Database connection failed**:
   ```bash
   docker logs trade-ai-mongodb-prod
   ```

3. **Frontend not loading**:
   ```bash
   curl -k https://yourdomain.com/api/health
   ```

4. **SSL certificate issues**:
   ```bash
   openssl x509 -in ssl/cert.pem -text -noout
   ```

## 📞 Support

### Documentation
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Security Checklist**: `SECURITY_CHECKLIST.md`

### Useful Commands
```bash
# Stop all services
docker-compose -f docker-compose.production.yml down

# Update services
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Backup database
docker exec trade-ai-mongodb-prod mongodump --authenticationDatabase admin \
    -u tradeai_admin -p "password" --db trade_ai_production --out /tmp/backup

# Clean up resources
docker system prune -f
```

## 🎯 Post-Deployment Checklist

- [ ] All services running and healthy
- [ ] Database initialized with GONXT company
- [ ] Test accounts accessible
- [ ] SSL certificates valid
- [ ] Domain resolving correctly
- [ ] Email notifications working
- [ ] Monitoring dashboard accessible
- [ ] All default passwords changed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Security checklist completed

## 🔐 Security Reminders

### Immediate Actions Required
1. **Change all default passwords**
2. **Update JWT secrets with secure random strings**
3. **Configure proper SMTP settings**
4. **Set up SSL certificates (replace self-signed)**
5. **Configure firewall rules**
6. **Set up monitoring alerts**
7. **Schedule regular backups**

### Ongoing Security
- Regular security updates
- Log monitoring and analysis
- User access reviews
- Vulnerability assessments
- Incident response planning

---

## 🎉 Success!

Once deployed, your Trade AI Platform will be accessible at:
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Monitoring**: https://yourdomain.com/monitoring

Login with any test account to start using the platform. Remember to change all default passwords and complete the security checklist!

---

**Version**: 2.0.0  
**Last Updated**: 2025-09-12  
**Environment**: Production Ready  
**Company**: GONXT Pre-configured