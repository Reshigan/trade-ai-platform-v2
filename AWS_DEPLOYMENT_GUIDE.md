# Trade AI Platform v2 - AWS Production Deployment Guide

## 🚀 Complete AWS Deployment Steps

This guide provides step-by-step instructions for deploying the Trade AI Platform v2 on AWS with GONXT demo data for prospective customers.

## 📋 Prerequisites

### AWS Account Requirements
- Active AWS account with billing enabled
- IAM user with EC2, VPC, and Route 53 permissions
- AWS CLI configured (optional but recommended)

### Minimum AWS Resources
- **EC2 Instance**: t3.large or larger (2 vCPU, 8GB RAM minimum)
- **Storage**: 100GB EBS volume (gp3 recommended)
- **Security Group**: Ports 22, 80, 443, 3001, 5001 open
- **Elastic IP**: For consistent public IP address

## 🏗️ Step 1: Launch AWS EC2 Instance

### 1.1 Create EC2 Instance
```bash
# Launch Ubuntu 22.04 LTS instance
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.large \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxxx \
    --subnet-id subnet-xxxxxxxxx \
    --block-device-mappings '[{
        "DeviceName": "/dev/sda1",
        "Ebs": {
            "VolumeSize": 100,
            "VolumeType": "gp3",
            "DeleteOnTermination": true
        }
    }]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=TradeAI-Production}]'
```

### 1.2 Manual AWS Console Steps
1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2/
2. **Launch Instance**:
   - **Name**: TradeAI-Production
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t3.large (minimum) or t3.xlarge (recommended)
   - **Key Pair**: Create or select existing key pair
   - **Storage**: 100GB gp3 EBS volume
3. **Configure Security Group**:
   - **SSH (22)**: Your IP address
   - **HTTP (80)**: 0.0.0.0/0
   - **HTTPS (443)**: 0.0.0.0/0
   - **Frontend (3001)**: 0.0.0.0/0
   - **Backend (5001)**: 0.0.0.0/0
4. **Launch Instance**

### 1.3 Allocate Elastic IP (Recommended)
```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Associate with instance
aws ec2 associate-address \
    --instance-id i-xxxxxxxxx \
    --allocation-id eipalloc-xxxxxxxxx
```

## 🔧 Step 2: Connect and Prepare Server

### 2.1 Connect to Instance
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-public-ip

# Update system
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Git
```bash
sudo apt install git -y
```

## 📥 Step 3: Clone and Deploy

### 3.1 Clone Repository
```bash
# Clone the repository
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2
```

### 3.2 Run Production Deployment
```bash
# Make deployment script executable
chmod +x aws-production-deploy.sh

# Run complete deployment (this will take 10-15 minutes)
./aws-production-deploy.sh
```

The deployment script will automatically:
- ✅ Install Docker and Docker Compose
- ✅ Clean up any previous deployments
- ✅ Create necessary directories and SSL certificates
- ✅ Build and deploy all services
- ✅ Wait for services to be ready
- ✅ Seed GONXT demo data with 2+ years of historical data
- ✅ Run comprehensive health checks
- ✅ Display access information

## 🎯 Step 4: Verify Deployment

### 4.1 Check Service Status
```bash
# Check all services are running
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform ps

# Should show all services as "Up"
```

### 4.2 Test Access URLs
- **Frontend**: http://your-public-ip:3001
- **Backend API**: http://your-public-ip:5001/api/health
- **AI Services**: http://your-public-ip:8000
- **Monitoring**: http://your-public-ip:8081

### 4.3 Test Demo Login
**GONXT Company (Primary Demo)**:
- URL: http://your-public-ip:3001
- Email: admin@gonxt.tech
- Password: GonxtAdmin2024!

**Test Company (Secondary Demo)**:
- URL: http://your-public-ip:3001
- Email: admin@test.demo
- Password: TestAdmin2024!

## 🏢 Step 5: Configure Domain (Optional)

### 5.1 Route 53 Configuration
If you have a domain, configure DNS:

```bash
# Create hosted zone (if not exists)
aws route53 create-hosted-zone \
    --name yourdomain.com \
    --caller-reference $(date +%s)

# Create A record pointing to your Elastic IP
aws route53 change-resource-record-sets \
    --hosted-zone-id Z123456789 \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "tradeai.yourdomain.com",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [{"Value": "your-elastic-ip"}]
            }
        }]
    }'
```

### 5.2 SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d tradeai.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/tradeai.yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/tradeai.yourdomain.com/privkey.pem ssl/
sudo chown ubuntu:ubuntu ssl/*.pem

# Restart nginx
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart nginx
```

## 📊 Demo Data Overview

The deployment includes comprehensive demo data for prospective customers:

### GONXT Company Demo Data
- **Historical Period**: 2+ years (2022-2024)
- **Customers**: 10 major Australian retailers
  - Woolworths, Coles, IGA, Metcash, ALDI
  - Costco, 7-Eleven, BP, Shell, Ampol
- **Products**: 25 products across 5 categories
  - Beverages, Snacks, Dairy, Personal Care, Household
- **Campaigns**: 15 promotional campaigns
- **Advanced Analytics**: Complete dataset for all features

### Advanced Analytics Features
1. **Trading Terms**: Complex profitability calculations
2. **Advanced Reporting**: PDF/Excel exports with scheduling
3. **AI Chat Assistant**: Company-specific insights
4. **Promotion Analysis**: ML-based success predictions
5. **Marketing Budget Allocation**: Flexible budget management
6. **Combination Analysis**: Long-term volume drivers

## 🔧 Management Commands

### Service Management
```bash
# View service status
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform ps

# View logs
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs -f [service_name]

# Restart specific service
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform restart [service_name]

# Stop all services
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform down

# Start all services
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform up -d
```

### System Monitoring
```bash
# Check system resources
htop
df -h
docker stats

# Check service health
curl http://localhost:5001/api/health
curl http://localhost:3001
```

## 🔒 Security Considerations

### Production Security Checklist
- ✅ Change default passwords in .env.production
- ✅ Configure proper SSL certificates
- ✅ Restrict SSH access to specific IP addresses
- ✅ Enable AWS CloudWatch monitoring
- ✅ Set up automated backups
- ✅ Configure log rotation
- ✅ Enable AWS Security Groups properly

### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # Frontend
sudo ufw allow 5001/tcp  # Backend API
```

## 📈 Performance Optimization

### AWS Instance Recommendations
- **Development/Demo**: t3.large (2 vCPU, 8GB RAM)
- **Production**: t3.xlarge (4 vCPU, 16GB RAM)
- **High Load**: c5.2xlarge (8 vCPU, 16GB RAM)

### Storage Optimization
- Use gp3 EBS volumes for better performance
- Consider separate volumes for database and logs
- Enable EBS optimization on instance

## 🔄 Backup and Recovery

### Automated Backups
The deployment includes automated backup scripts:

```bash
# Manual backup
docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform exec mongodb mongodump --out /backups/manual-$(date +%Y%m%d)

# View backups
ls -la backups/
```

### AWS Backup Integration
Consider setting up AWS Backup for EBS snapshots:

```bash
# Create EBS snapshot
aws ec2 create-snapshot \
    --volume-id vol-xxxxxxxxx \
    --description "TradeAI-Production-$(date +%Y%m%d)"
```

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   # Check logs
   docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform logs [service_name]
   
   # Restart deployment
   ./aws-production-deploy.sh
   ```

2. **Port conflicts**:
   ```bash
   # Check what's using ports
   sudo netstat -tulpn | grep :3001
   sudo netstat -tulpn | grep :5001
   ```

3. **Memory issues**:
   ```bash
   # Check memory usage
   free -h
   docker stats
   
   # Consider upgrading instance type
   ```

4. **Database connection issues**:
   ```bash
   # Check MongoDB status
   docker-compose -f docker-compose.aws-production.yml -p trade-ai-platform exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```

### Log Locations
- **Application Logs**: `./logs/`
- **Docker Logs**: `docker-compose logs`
- **System Logs**: `/var/log/`

## 📞 Support and Maintenance

### Health Monitoring
- **Health Endpoint**: http://your-ip:5001/api/health
- **Service Status**: `docker-compose ps`
- **System Metrics**: Available at monitoring endpoint

### Regular Maintenance
- Update system packages monthly
- Monitor disk space usage
- Review security logs
- Test backup and restore procedures

## 🎉 Deployment Complete!

After following these steps, you'll have:

✅ **Complete Trade AI Platform v2** running on AWS
✅ **GONXT demo environment** with 2+ years of data
✅ **All advanced analytics features** enabled
✅ **Production-ready configuration** with monitoring
✅ **Demo credentials** ready for prospective customers

The platform is now ready to demonstrate to prospective customers with comprehensive FMCG trade spend management capabilities and advanced AI-powered analytics.

---

**Need Help?** 
- Check service logs: `docker-compose logs -f [service_name]`
- Verify health: `curl http://your-ip:5001/api/health`
- Contact support with deployment logs if issues persist