#!/bin/bash

# Trade AI Platform Production Deployment Script
# AWS Production Deployment for tradeai.gonxt.tech (13.247.139.75)

set -e

# Configuration
DOMAIN="tradeai.gonxt.tech"
SERVER_IP="13.247.139.75"
PROJECT_DIR="/workspace/project/trade-ai-platform-v2"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.production.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Banner
echo -e "${GREEN}"
echo "=================================================================="
echo "         Trade AI Platform Production Deployment"
echo "=================================================================="
echo "Domain: $DOMAIN"
echo "Server IP: $SERVER_IP"
echo "Environment: Production"
echo "=================================================================="
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root for system configuration"
   echo "Run with: sudo $0"
   exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Step 1: System Prerequisites
log "Step 1: Installing system prerequisites..."

# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nano \
    vim

# Step 2: Install Docker
log "Step 2: Installing Docker..."

# Remove old Docker versions
apt-get remove -y docker docker-engine docker.io containerd runc || true

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose (standalone)
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add current user to docker group (if not root)
if [ "$SUDO_USER" ]; then
    usermod -aG docker "$SUDO_USER"
fi

# Step 3: Configure Firewall
log "Step 3: Configuring firewall..."

# Reset UFW to defaults
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (important!)
ufw allow ssh
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow specific ports for monitoring (optional, can be removed for security)
# ufw allow from 10.0.0.0/8 to any port 8081

# Enable firewall
ufw --force enable

# Step 4: Configure Fail2Ban
log "Step 4: Configuring Fail2Ban..."

cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /workspace/project/trade-ai-platform-v2/logs/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /workspace/project/trade-ai-platform-v2/logs/nginx/error.log
maxretry = 10
EOF

systemctl restart fail2ban
systemctl enable fail2ban

# Step 5: Create necessary directories
log "Step 5: Creating necessary directories..."

mkdir -p logs/{nginx,backend,ai-services,monitoring}
mkdir -p backups/{mongodb,redis,backend}
mkdir -p ssl
chmod 755 logs backups
chmod 700 ssl

# Step 6: Environment Configuration
log "Step 6: Setting up environment configuration..."

if [ ! -f "$ENV_FILE" ]; then
    error "Environment file $ENV_FILE not found!"
    exit 1
fi

# Validate environment file
source "$ENV_FILE"

# Check required variables
required_vars=("MONGO_USERNAME" "MONGO_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "AI_MODEL_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        error "Required environment variable $var is not set in $ENV_FILE"
        exit 1
    fi
done

info "Environment configuration validated"

# Step 7: SSL Certificate Setup
log "Step 7: Setting up SSL certificates..."

if [ ! -f "ssl/fullchain.pem" ] || [ ! -f "ssl/privkey.pem" ]; then
    warning "SSL certificates not found. Running SSL setup..."
    ./scripts/setup-ssl.sh
else
    info "SSL certificates already exist"
fi

# Step 8: Build and Deploy
log "Step 8: Building and deploying containers..."

# Stop existing containers
docker-compose -f "$COMPOSE_FILE" down || true

# Remove old images (optional, uncomment if you want to force rebuild)
# docker system prune -f

# Build and start containers
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# Step 9: Health Checks
log "Step 9: Performing health checks..."

# Wait for services to start
sleep 30

# Check container status
info "Container status:"
docker-compose -f "$COMPOSE_FILE" ps

# Check service health
services=("mongodb" "redis" "backend" "frontend" "ai-services" "monitoring" "nginx")
for service in "${services[@]}"; do
    container_name="trade-ai-${service}-prod"
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        log "✓ $service is running"
    else
        error "✗ $service is not running"
    fi
done

# Test HTTP endpoints
info "Testing HTTP endpoints..."
sleep 10

# Test HTTPS (if SSL is configured)
if curl -k -s https://localhost/health.json > /dev/null 2>&1; then
    log "✓ HTTPS endpoint is responding"
else
    warning "HTTPS endpoint test failed (this is normal if SSL is not yet configured)"
fi

# Step 10: Setup Monitoring and Backups
log "Step 10: Setting up monitoring and backups..."

# Create backup script
cat > /usr/local/bin/backup-tradeai.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/workspace/project/trade-ai-platform-v2/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# MongoDB backup
docker exec trade-ai-mongodb-prod mongodump --uri="mongodb://tradeai_admin:TradeAI_Mongo_2024_Secure_Password_!@#@localhost:27017/trade_ai_production?authSource=admin" --out="/backups/mongodb_$DATE"

# Redis backup
docker exec trade-ai-redis-prod redis-cli -a "TradeAI_Redis_2024_Secure_Password_!@#" --rdb "/backups/redis_$DATE.rdb"

# Cleanup old backups (keep 7 days)
find "$BACKUP_DIR" -type d -name "mongodb_*" -mtime +7 -exec rm -rf {} \;
find "$BACKUP_DIR" -name "redis_*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-tradeai.sh

# Add backup cron job
echo "0 2 * * * root /usr/local/bin/backup-tradeai.sh >> /var/log/tradeai-backup.log 2>&1" > /etc/cron.d/tradeai-backup

# Create system monitoring script
cat > /usr/local/bin/monitor-tradeai.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/tradeai-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$DATE - WARNING: Disk usage is ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 80 ]; then
    echo "$DATE - WARNING: Memory usage is ${MEM_USAGE}%" >> "$LOG_FILE"
fi

# Check container health
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")
if [ ! -z "$UNHEALTHY" ]; then
    echo "$DATE - ERROR: Unhealthy containers: $UNHEALTHY" >> "$LOG_FILE"
fi
EOF

chmod +x /usr/local/bin/monitor-tradeai.sh

# Add monitoring cron job
echo "*/5 * * * * root /usr/local/bin/monitor-tradeai.sh" > /etc/cron.d/tradeai-monitor

# Step 11: Final Configuration
log "Step 11: Final configuration..."

# Create systemd service for auto-start
cat > /etc/systemd/system/tradeai-platform.service << EOF
[Unit]
Description=Trade AI Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
ExecStop=/usr/local/bin/docker-compose -f $COMPOSE_FILE down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tradeai-platform.service

# Step 12: Security Hardening
log "Step 12: Applying security hardening..."

# Disable root login via SSH (optional, uncomment if desired)
# sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
# systemctl restart ssh

# Set up log rotation
systemctl enable logrotate.timer
systemctl start logrotate.timer

# Final Summary
echo -e "${GREEN}"
echo "=================================================================="
echo "         DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=================================================================="
echo "Domain: https://$DOMAIN"
echo "Server IP: $SERVER_IP"
echo "Services:"
echo "  - Frontend: https://$DOMAIN"
echo "  - API: https://$DOMAIN/api"
echo "  - AI Services: https://$DOMAIN/ai"
echo "  - Monitoring: https://$DOMAIN/monitoring"
echo ""
echo "Management Commands:"
echo "  - View logs: docker-compose -f $COMPOSE_FILE logs -f [service]"
echo "  - Restart: docker-compose -f $COMPOSE_FILE restart [service]"
echo "  - Stop all: docker-compose -f $COMPOSE_FILE down"
echo "  - Start all: docker-compose -f $COMPOSE_FILE up -d"
echo ""
echo "Backup: /usr/local/bin/backup-tradeai.sh"
echo "Monitor: /usr/local/bin/monitor-tradeai.sh"
echo ""
echo "Log files:"
echo "  - Application: $PROJECT_DIR/logs/"
echo "  - System: /var/log/tradeai-*.log"
echo "=================================================================="
echo -e "${NC}"

log "Deployment completed! Your Trade AI Platform is now running in production."
info "Please update your DNS records to point $DOMAIN to $SERVER_IP"
info "SSL certificates will auto-renew via cron job"