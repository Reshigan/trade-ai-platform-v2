# Trade AI Platform v2 - Fresh Deployment Guide

This guide provides scripts and instructions for completely cleaning and redeploying the Trade AI Platform v2 from scratch.

## 🚀 Deployment Scripts

### 1. `fresh-deploy.sh` - Production Server Deployment
**Use for**: Production servers, VPS, dedicated servers
**Features**:
- Complete system cleanup and fresh installation
- Automatic backup of existing data
- Full dependency installation (Docker, Node.js, Python)
- Systemd service creation
- Firewall configuration
- Monitoring and logging setup
- Health checks and validation

**Requirements**: Root access (run with sudo)

```bash
sudo ./fresh-deploy.sh
```

### 2. `quick-reset.sh` - Development/Testing Reset
**Use for**: Development environments, testing, local machines
**Features**:
- Quick Docker cleanup and restart
- Fresh repository clone
- Basic environment setup
- Faster execution for development cycles

**Requirements**: Docker installed

```bash
./quick-reset.sh
```

## 📋 Pre-Deployment Checklist

### Server Requirements
- **OS**: Ubuntu 20.04+ or Debian 11+ (recommended)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 20GB free space
- **Network**: Open ports 80, 443, 3000, 5000, 8000, 8080
- **Access**: Root/sudo privileges

### Before Running Scripts
1. **Backup Important Data**: Scripts will create backups, but ensure you have external backups
2. **Check Network**: Ensure stable internet connection for downloads
3. **Verify Permissions**: Make sure you have sudo/root access
4. **Review Configuration**: Check if you need custom environment variables

## 🔧 What the Scripts Do

### Fresh Deploy Script (`fresh-deploy.sh`)

#### Phase 1: Cleanup
- Stops all Docker containers and services
- Removes old Docker images, volumes, networks
- Kills remaining processes
- Removes systemd services
- Cleans nginx configurations
- Removes log directories and temp files

#### Phase 2: Backup
- Creates timestamped backup in `/opt/backups/`
- Backs up existing deployment directory
- Exports Docker volume data
- Saves configuration files and logs

#### Phase 3: System Setup
- Updates system packages
- Installs Docker and Docker Compose
- Installs Node.js (LTS version)
- Installs Python 3 and pip
- Installs essential system tools

#### Phase 4: Application Deployment
- Clones fresh repository to `/opt/trade-ai/`
- Creates production environment file
- Sets up directory structure and permissions
- Builds Docker images
- Starts all services

#### Phase 5: System Integration
- Creates systemd service for auto-start
- Configures UFW firewall rules
- Sets up log rotation
- Creates monitoring scripts
- Adds cron jobs for health checks

#### Phase 6: Validation
- Runs comprehensive health checks
- Tests all service endpoints
- Verifies database connections
- Displays final status and URLs

### Quick Reset Script (`quick-reset.sh`)

#### What it does:
1. Stops and removes all Docker containers
2. Cleans Docker volumes and system
3. Removes old project directory
4. Clones fresh repository
5. Creates development environment
6. Builds and starts services
7. Runs basic health checks

## 🌐 Post-Deployment Configuration

### 1. SSL/HTTPS Setup
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Domain Configuration
Update `/opt/trade-ai/.env`:
```bash
# Production URLs
API_BASE_URL=https://yourdomain.com/api
REACT_APP_API_URL=https://yourdomain.com/api
```

### 3. Database Security
```bash
# Access MongoDB container
docker-compose exec mongodb mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})
```

### 4. Monitoring Setup
```bash
# View monitoring dashboard
curl http://localhost:8080/health

# Check logs
tail -f /var/log/trade-ai/monitor.log

# View Docker logs
docker-compose logs -f
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Docker Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

#### 2. Port Already in Use
```bash
# Find process using port
sudo netstat -tulpn | grep :5000
# Kill process
sudo kill -9 <PID>
```

#### 3. Out of Disk Space
```bash
# Clean Docker system
docker system prune -af --volumes
# Clean logs
sudo journalctl --vacuum-time=7d
```

#### 4. Services Not Starting
```bash
# Check Docker daemon
sudo systemctl status docker
# Restart Docker
sudo systemctl restart docker
# Check logs
docker-compose logs
```

#### 5. Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
# Check Redis status
docker-compose exec redis redis-cli ping
```

## 📊 Service Management

### Systemd Commands (Production)
```bash
# Start services
sudo systemctl start trade-ai

# Stop services
sudo systemctl stop trade-ai

# Restart services
sudo systemctl restart trade-ai

# Check status
sudo systemctl status trade-ai

# View logs
sudo journalctl -u trade-ai -f
```

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Rebuild and restart
docker-compose up -d --build
```

## 🔐 Security Considerations

### Firewall Rules
The script configures UFW with these rules:
- SSH (22): Allowed
- HTTP (80): Allowed
- HTTPS (443): Allowed
- Application ports (3000, 5000, 8000, 8080): Allowed

### Environment Security
- Change default JWT secrets
- Use strong database passwords
- Enable SSL/TLS in production
- Regular security updates
- Monitor access logs

### Docker Security
- Run containers as non-root users
- Use official base images
- Regular image updates
- Scan for vulnerabilities

## 📈 Monitoring and Maintenance

### Automated Monitoring
The script sets up:
- Health check every 5 minutes
- Log rotation (30 days retention)
- Disk space monitoring (alert at 80%)
- Memory usage monitoring (alert at 80%)

### Manual Checks
```bash
# System resources
htop
df -h
free -h

# Service health
curl http://localhost:5000/api/health
curl http://localhost:8000/health

# Database status
docker-compose exec mongodb mongosh --eval "db.stats()"
docker-compose exec redis redis-cli info
```

### Backup Strategy
- Automated daily backups (2 AM)
- 30-day retention policy
- Database exports included
- Configuration files backed up

## 🚨 Emergency Procedures

### Quick Service Restart
```bash
cd /opt/trade-ai
sudo docker-compose restart
```

### Rollback to Backup
```bash
# Stop services
sudo systemctl stop trade-ai

# Restore from backup
sudo cp -r /opt/backups/trade-ai-YYYYMMDD-HHMMSS/trade-ai /opt/

# Start services
sudo systemctl start trade-ai
```

### Complete Reset
```bash
# Run fresh deployment again
sudo ./fresh-deploy.sh
```

## 📞 Support

### Log Locations
- Application logs: `/var/log/trade-ai/`
- Docker logs: `docker-compose logs`
- System logs: `/var/log/syslog`
- Monitoring logs: `/var/log/trade-ai/monitor.log`

### Useful Commands
```bash
# Check all services
sudo systemctl list-units --type=service | grep trade-ai

# Monitor real-time logs
tail -f /var/log/trade-ai/*.log

# Check Docker resource usage
docker stats

# Backup current state
sudo rsync -av /opt/trade-ai/ /backup/trade-ai-$(date +%Y%m%d)/
```

---

## 🎯 Quick Start

1. **Download the script**:
   ```bash
   wget https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/fresh-deploy.sh
   chmod +x fresh-deploy.sh
   ```

2. **Run deployment**:
   ```bash
   sudo ./fresh-deploy.sh
   ```

3. **Access your application**:
   - Frontend: `http://your-server-ip:3000`
   - Backend API: `http://your-server-ip:5000`
   - Monitoring: `http://your-server-ip:8080`

That's it! Your Trade AI Platform v2 should be running fresh and clean.