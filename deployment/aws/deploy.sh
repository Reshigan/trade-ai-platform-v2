#!/bin/bash

# Trade AI Platform v2 - AWS Production Deployment Script
# Server: 13.247.139.75 (GONXT Production)
# Domain: tradeai.gonxt.tech

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="13.247.139.75"
DOMAIN="tradeai.gonxt.tech"
APP_DIR="/opt/trade-ai-platform-v2"
BACKUP_DIR="/opt/backups/trade-ai"
LOG_DIR="/var/log/trade-ai"
SSL_EMAIL="admin@gonxt.tech"

echo -e "${BLUE}=== Trade AI Platform v2 - AWS Production Deployment ===${NC}"
echo -e "${BLUE}Server: ${SERVER_IP}${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
print_status "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Create application directories
print_status "Creating application directories..."
mkdir -p ${APP_DIR}
mkdir -p ${BACKUP_DIR}
mkdir -p ${LOG_DIR}
mkdir -p /opt/ssl

# Create application user
print_status "Creating application user..."
if ! id "tradeai" &>/dev/null; then
    useradd -r -s /bin/false -d ${APP_DIR} tradeai
    usermod -aG docker tradeai
    print_status "User 'tradeai' created successfully"
else
    print_status "User 'tradeai' already exists"
fi

# Set up firewall
print_status "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_status "Firewall configured successfully"

# Configure fail2ban
print_status "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl restart fail2ban
print_status "Fail2ban configured successfully"

# Clone or update application code
print_status "Deploying application code..."
if [ -d "${APP_DIR}/.git" ]; then
    print_status "Updating existing repository..."
    cd ${APP_DIR}
    git fetch origin
    git reset --hard origin/main
else
    print_status "Cloning repository..."
    git clone https://github.com/Reshigan/trade-ai-platform-v2.git ${APP_DIR}
    cd ${APP_DIR}
fi

# Set proper permissions
chown -R tradeai:tradeai ${APP_DIR}
chown -R tradeai:tradeai ${BACKUP_DIR}
chown -R tradeai:tradeai ${LOG_DIR}

# Copy environment file
print_status "Setting up environment configuration..."
if [ ! -f "${APP_DIR}/.env" ]; then
    cp ${APP_DIR}/.env.production ${APP_DIR}/.env
    print_status "Environment file created from production template"
else
    print_warning "Environment file already exists, skipping copy"
fi

# Create log rotation configuration
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/trade-ai << EOF
${LOG_DIR}/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 tradeai tradeai
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
        docker-compose -f ${APP_DIR}/docker-compose.production.yml restart nginx > /dev/null 2>&1 || true
    endscript
}
EOF

# Set up SSL certificate
print_status "Setting up SSL certificate..."
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    print_status "Obtaining SSL certificate from Let's Encrypt..."
    certbot certonly --standalone --non-interactive --agree-tos --email ${SSL_EMAIL} -d ${DOMAIN}
    
    # Create renewal hook
    cat > /etc/letsencrypt/renewal-hooks/deploy/trade-ai-reload.sh << EOF
#!/bin/bash
docker-compose -f ${APP_DIR}/docker-compose.production.yml restart nginx
EOF
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/trade-ai-reload.sh
    
    print_status "SSL certificate obtained successfully"
else
    print_status "SSL certificate already exists"
fi

# Create systemd service for the application
print_status "Creating systemd service..."
cat > /etc/systemd/system/trade-ai.service << EOF
[Unit]
Description=Trade AI Platform v2
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
TimeoutStartSec=0
User=tradeai
Group=tradeai

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable trade-ai.service

# Create backup script
print_status "Creating backup script..."
mkdir -p /opt/scripts
cat > /opt/scripts/backup-trade-ai.sh << 'EOF'
#!/bin/bash

# Trade AI Platform Backup Script
BACKUP_DIR="/opt/backups/trade-ai"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/trade-ai-platform-v2"

# Create backup directory
mkdir -p ${BACKUP_DIR}/${DATE}

# Backup MongoDB
docker exec trade-ai-mongodb-prod mongodump --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123 --out ${BACKUP_DIR}/${DATE}/mongodb

# Backup application files
tar -czf ${BACKUP_DIR}/${DATE}/app-files.tar.gz -C ${APP_DIR} --exclude=node_modules --exclude=.git .

# Backup logs
tar -czf ${BACKUP_DIR}/${DATE}/logs.tar.gz -C /var/log trade-ai

# Remove backups older than 30 days
find ${BACKUP_DIR} -type d -mtime +30 -exec rm -rf {} +

echo "Backup completed: ${BACKUP_DIR}/${DATE}"
EOF

chmod +x /opt/scripts/backup-trade-ai.sh

# Set up cron job for backups
print_status "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/scripts/backup-trade-ai.sh >> /var/log/trade-ai/backup.log 2>&1") | crontab -

# Create monitoring script
print_status "Creating monitoring script..."
cat > /opt/scripts/monitor-trade-ai.sh << 'EOF'
#!/bin/bash

# Trade AI Platform Monitoring Script
APP_DIR="/opt/trade-ai-platform-v2"
LOG_FILE="/var/log/trade-ai/monitor.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> ${LOG_FILE}
}

# Check if containers are running
check_containers() {
    containers=("trade-ai-mongodb-prod" "trade-ai-backend-prod" "trade-ai-frontend-prod" "trade-ai-nginx-prod")
    
    for container in "${containers[@]}"; do
        if ! docker ps | grep -q ${container}; then
            log_message "ERROR: Container ${container} is not running"
            # Restart the service
            systemctl restart trade-ai.service
            log_message "INFO: Restarted trade-ai service due to container failure"
            break
        fi
    done
}

# Check disk space
check_disk_space() {
    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ ${usage} -gt 85 ]; then
        log_message "WARNING: Disk usage is ${usage}%"
    fi
}

# Check memory usage
check_memory() {
    memory_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    if (( $(echo "${memory_usage} > 85" | bc -l) )); then
        log_message "WARNING: Memory usage is ${memory_usage}%"
    fi
}

# Run checks
check_containers
check_disk_space
check_memory

log_message "INFO: Health check completed"
EOF

chmod +x /opt/scripts/monitor-trade-ai.sh

# Set up monitoring cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/scripts/monitor-trade-ai.sh") | crontab -

# Build and start the application
print_status "Building and starting the application..."
cd ${APP_DIR}

# Make sure we have the latest images
docker-compose -f docker-compose.production.yml pull

# Build the application
docker-compose -f docker-compose.production.yml build --no-cache

# Start the application
docker-compose -f docker-compose.production.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Seed the database
print_status "Seeding database with GONXT data..."
docker exec trade-ai-mongodb-prod mongosh trade-ai --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123 /seed/seed-gonxt-data.js

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Test the application
print_status "Testing application endpoints..."
sleep 10

if curl -f -s http://localhost/health > /dev/null; then
    print_status "✅ Application is responding on HTTP"
else
    print_warning "❌ Application is not responding on HTTP"
fi

if curl -f -s https://${DOMAIN}/health > /dev/null; then
    print_status "✅ Application is responding on HTTPS"
else
    print_warning "❌ Application is not responding on HTTPS"
fi

# Display final information
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}Application URL: https://${DOMAIN}${NC}"
echo -e "${GREEN}Server IP: ${SERVER_IP}${NC}"
echo ""
echo -e "${BLUE}Login Credentials:${NC}"
echo -e "${BLUE}GONXT Admin: admin@gonxt.tech / password123${NC}"
echo -e "${BLUE}Test Company: demo@testcompany.demo / password123${NC}"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo -e "${BLUE}Start:   systemctl start trade-ai${NC}"
echo -e "${BLUE}Stop:    systemctl stop trade-ai${NC}"
echo -e "${BLUE}Restart: systemctl restart trade-ai${NC}"
echo -e "${BLUE}Status:  systemctl status trade-ai${NC}"
echo -e "${BLUE}Logs:    docker-compose -f ${APP_DIR}/docker-compose.production.yml logs -f${NC}"
echo ""
echo -e "${BLUE}Backup: /opt/scripts/backup-trade-ai.sh${NC}"
echo -e "${BLUE}Monitor: /opt/scripts/monitor-trade-ai.sh${NC}"
echo ""
print_status "Deployment completed successfully!"