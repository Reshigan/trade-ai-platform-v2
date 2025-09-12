#!/bin/bash

# Trade AI Platform v2 - Clean Production Installation Script
# Server: 13.247.139.75 (GONXT Production)
# Domain: tradeai.gonxt.tech
# Version: 2.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="13.247.139.75"
DOMAIN="tradeai.gonxt.tech"
APP_DIR="/opt/trade-ai-platform-v2"
BACKUP_DIR="/opt/backups/trade-ai"
LOG_DIR="/var/log/trade-ai"
SCRIPTS_DIR="/opt/scripts"
SSL_EMAIL="admin@gonxt.tech"
REPO_URL="https://github.com/Reshigan/trade-ai-platform-v2.git"

# Print banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                Trade AI Platform v2                          ║"
echo "║              Clean Production Installation                    ║"
echo "║                                                              ║"
echo "║  Server: ${SERVER_IP}                               ║"
echo "║  Domain: ${DOMAIN}                            ║"
echo "║  Version: 2.0.0                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
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

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_step "Starting clean installation process..."

# Step 1: System Update
print_step "1/12 - Updating system packages..."
apt-get update -y >/dev/null 2>&1
apt-get upgrade -y >/dev/null 2>&1
print_success "System packages updated"

# Step 2: Install Dependencies
print_step "2/12 - Installing system dependencies..."
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
    lsb-release \
    bc >/dev/null 2>&1
print_success "System dependencies installed"

# Step 3: Install Docker
print_step "3/12 - Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y >/dev/null 2>&1
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin >/dev/null 2>&1
    systemctl enable docker >/dev/null 2>&1
    systemctl start docker >/dev/null 2>&1
    print_success "Docker installed and started"
else
    print_success "Docker already installed"
fi

# Step 4: Create Directories
print_step "4/12 - Creating application directories..."
mkdir -p ${APP_DIR}
mkdir -p ${BACKUP_DIR}
mkdir -p ${LOG_DIR}
mkdir -p ${SCRIPTS_DIR}
mkdir -p /opt/ssl
print_success "Directories created"

# Step 5: Create Application User
print_step "5/12 - Creating application user..."
if ! id "tradeai" &>/dev/null; then
    useradd -r -s /bin/false -d ${APP_DIR} tradeai
    usermod -aG docker tradeai
    print_success "User 'tradeai' created"
else
    print_success "User 'tradeai' already exists"
fi

# Step 6: Configure Firewall
print_step "6/12 - Configuring firewall..."
ufw --force reset >/dev/null 2>&1
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1
ufw allow ssh >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1
print_success "Firewall configured"

# Step 7: Configure Fail2Ban
print_step "7/12 - Configuring fail2ban..."
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

systemctl enable fail2ban >/dev/null 2>&1
systemctl restart fail2ban >/dev/null 2>&1
print_success "Fail2ban configured"

# Step 8: Clone Application
print_step "8/12 - Cloning application repository..."
if [ -d "${APP_DIR}/.git" ]; then
    print_status "Repository exists, updating..."
    cd ${APP_DIR}
    git fetch origin >/dev/null 2>&1
    git reset --hard origin/main >/dev/null 2>&1
else
    print_status "Cloning repository..."
    git clone ${REPO_URL} ${APP_DIR} >/dev/null 2>&1
    cd ${APP_DIR}
fi
print_success "Application code deployed"

# Step 9: Set Permissions
print_step "9/12 - Setting permissions..."
chown -R tradeai:tradeai ${APP_DIR}
chown -R tradeai:tradeai ${BACKUP_DIR}
chown -R tradeai:tradeai ${LOG_DIR}
print_success "Permissions set"

# Step 10: Configure Environment
print_step "10/12 - Configuring environment..."
if [ ! -f "${APP_DIR}/.env" ]; then
    cp ${APP_DIR}/.env.production ${APP_DIR}/.env
    print_success "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Step 11: Create Management Scripts
print_step "11/12 - Creating management scripts..."

# Backup script
cat > ${SCRIPTS_DIR}/backup-trade-ai.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/trade-ai"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/trade-ai-platform-v2"

mkdir -p ${BACKUP_DIR}/${DATE}

# Backup MongoDB
docker exec trade-ai-mongodb-prod mongodump --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123 --out ${BACKUP_DIR}/${DATE}/mongodb 2>/dev/null

# Backup application files
tar -czf ${BACKUP_DIR}/${DATE}/app-files.tar.gz -C ${APP_DIR} --exclude=node_modules --exclude=.git . 2>/dev/null

# Backup logs
tar -czf ${BACKUP_DIR}/${DATE}/logs.tar.gz -C /var/log trade-ai 2>/dev/null

# Remove backups older than 30 days
find ${BACKUP_DIR} -type d -mtime +30 -exec rm -rf {} + 2>/dev/null

echo "$(date): Backup completed: ${BACKUP_DIR}/${DATE}" >> /var/log/trade-ai/backup.log
EOF

# Monitoring script
cat > ${SCRIPTS_DIR}/monitor-trade-ai.sh << 'EOF'
#!/bin/bash
APP_DIR="/opt/trade-ai-platform-v2"
LOG_FILE="/var/log/trade-ai/monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> ${LOG_FILE}
}

check_containers() {
    containers=("trade-ai-mongodb-prod" "trade-ai-backend-prod" "trade-ai-frontend-prod" "trade-ai-nginx-prod")
    
    for container in "${containers[@]}"; do
        if ! docker ps | grep -q ${container}; then
            log_message "ERROR: Container ${container} is not running"
            systemctl restart trade-ai.service
            log_message "INFO: Restarted trade-ai service"
            break
        fi
    done
}

check_disk_space() {
    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ ${usage} -gt 85 ]; then
        log_message "WARNING: Disk usage is ${usage}%"
    fi
}

check_memory() {
    memory_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    if (( $(echo "${memory_usage} > 85" | bc -l) )); then
        log_message "WARNING: Memory usage is ${memory_usage}%"
    fi
}

check_containers
check_disk_space
check_memory
log_message "INFO: Health check completed"
EOF

# Health check script
cat > ${SCRIPTS_DIR}/health-check.sh << 'EOF'
#!/bin/bash

echo "=== Trade AI Platform Health Check ==="
echo "Date: $(date)"
echo ""

echo "1. Docker Status:"
systemctl is-active docker

echo ""
echo "2. Trade AI Service Status:"
systemctl is-active trade-ai.service

echo ""
echo "3. Container Status:"
docker compose -f /opt/trade-ai-platform-v2/docker-compose.production.yml ps

echo ""
echo "4. Disk Usage:"
df -h /

echo ""
echo "5. Memory Usage:"
free -h

echo ""
echo "6. Application Health:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/health 2>/dev/null || echo "Application not responding"

echo ""
echo "7. SSL Certificate:"
if [ -f "/etc/letsencrypt/live/tradeai.gonxt.tech/fullchain.pem" ]; then
    echo "SSL Certificate exists"
    openssl x509 -in /etc/letsencrypt/live/tradeai.gonxt.tech/fullchain.pem -noout -dates
else
    echo "SSL Certificate not found"
fi

echo ""
echo "=== Health Check Complete ==="
EOF

# Make scripts executable
chmod +x ${SCRIPTS_DIR}/*.sh
print_success "Management scripts created"

# Step 12: Create Systemd Service
print_step "12/12 - Creating systemd service..."
cat > /etc/systemd/system/trade-ai.service << EOF
[Unit]
Description=Trade AI Platform v2
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/docker compose -f docker-compose.production.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.production.yml down
TimeoutStartSec=300
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload >/dev/null 2>&1
systemctl enable trade-ai.service >/dev/null 2>&1
print_success "Systemd service created and enabled"

# Configure log rotation
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
        docker compose -f ${APP_DIR}/docker-compose.production.yml restart nginx > /dev/null 2>&1 || true
    endscript
}
EOF

# Set up cron jobs
print_status "Setting up automated tasks..."
(crontab -l 2>/dev/null | grep -v backup-trade-ai.sh; echo "0 2 * * * ${SCRIPTS_DIR}/backup-trade-ai.sh") | crontab -
(crontab -l 2>/dev/null | grep -v monitor-trade-ai.sh; echo "*/5 * * * * ${SCRIPTS_DIR}/monitor-trade-ai.sh") | crontab -

# SSL Certificate Setup
print_status "Setting up SSL certificate..."
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    print_status "Obtaining SSL certificate..."
    certbot certonly --standalone --non-interactive --agree-tos --email ${SSL_EMAIL} -d ${DOMAIN} >/dev/null 2>&1
    
    # Create renewal hook
    mkdir -p /etc/letsencrypt/renewal-hooks/deploy
    cat > /etc/letsencrypt/renewal-hooks/deploy/trade-ai-reload.sh << EOF
#!/bin/bash
docker compose -f ${APP_DIR}/docker-compose.production.yml restart nginx
EOF
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/trade-ai-reload.sh
    print_success "SSL certificate obtained"
else
    print_success "SSL certificate already exists"
fi

# Build and Start Application
print_status "Building and starting application..."
cd ${APP_DIR}

# Pull latest images
docker compose -f docker-compose.production.yml pull >/dev/null 2>&1

# Build application
print_status "Building containers (this may take a few minutes)..."
docker compose -f docker-compose.production.yml build --no-cache >/dev/null 2>&1

# Start services
print_status "Starting services..."
docker compose -f docker-compose.production.yml up -d

# Wait for services to be ready
print_status "Waiting for services to initialize..."
sleep 45

# Seed database
print_status "Seeding database with GONXT data..."
docker exec trade-ai-mongodb-prod mongosh trade-ai --authenticationDatabase admin -u tradeai_admin -p TradeAI_Mongo_2024_Secure_Password_123 /seed/seed-gonxt-data.js >/dev/null 2>&1

# Final health check
print_status "Performing final health check..."
sleep 10

# Test endpoints
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/health 2>/dev/null || echo "000")

# Display results
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    INSTALLATION COMPLETE                     ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}🚀 Application Details:${NC}"
echo -e "   URL: ${CYAN}https://${DOMAIN}${NC}"
echo -e "   Server: ${CYAN}${SERVER_IP}${NC}"
echo -e "   Status: ${GREEN}Running${NC}"
echo ""

echo -e "${GREEN}🔐 Login Credentials:${NC}"
echo -e "   ${YELLOW}GONXT Admin:${NC}"
echo -e "     Email: ${CYAN}admin@gonxt.tech${NC}"
echo -e "     Password: ${CYAN}password123${NC}"
echo ""
echo -e "   ${YELLOW}Test Company:${NC}"
echo -e "     Email: ${CYAN}demo@testcompany.demo${NC}"
echo -e "     Password: ${CYAN}password123${NC}"
echo ""

echo -e "${GREEN}📊 Data Overview:${NC}"
echo -e "   • 2 years of GONXT business data (2023-2024)"
echo -e "   • 50 customers, 100 products"
echo -e "   • 20,000 sales transactions"
echo -e "   • 5,000 trade spend records"
echo -e "   • 200 promotional campaigns"
echo ""

echo -e "${GREEN}🛠️ Management Commands:${NC}"
echo -e "   Start:    ${CYAN}systemctl start trade-ai${NC}"
echo -e "   Stop:     ${CYAN}systemctl stop trade-ai${NC}"
echo -e "   Restart:  ${CYAN}systemctl restart trade-ai${NC}"
echo -e "   Status:   ${CYAN}systemctl status trade-ai${NC}"
echo -e "   Logs:     ${CYAN}docker compose -f ${APP_DIR}/docker-compose.production.yml logs -f${NC}"
echo -e "   Health:   ${CYAN}${SCRIPTS_DIR}/health-check.sh${NC}"
echo -e "   Backup:   ${CYAN}${SCRIPTS_DIR}/backup-trade-ai.sh${NC}"
echo ""

echo -e "${GREEN}🔍 Health Status:${NC}"
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "   HTTP:  ${GREEN}✅ Working (Status: $HTTP_STATUS)${NC}"
else
    echo -e "   HTTP:  ${RED}❌ Not responding (Status: $HTTP_STATUS)${NC}"
fi

if [ "$HTTPS_STATUS" = "200" ]; then
    echo -e "   HTTPS: ${GREEN}✅ Working (Status: $HTTPS_STATUS)${NC}"
else
    echo -e "   HTTPS: ${RED}❌ Not responding (Status: $HTTPS_STATUS)${NC}"
fi

echo ""
echo -e "${GREEN}📁 Important Paths:${NC}"
echo -e "   Application: ${CYAN}${APP_DIR}${NC}"
echo -e "   Logs:        ${CYAN}${LOG_DIR}${NC}"
echo -e "   Backups:     ${CYAN}${BACKUP_DIR}${NC}"
echo -e "   Scripts:     ${CYAN}${SCRIPTS_DIR}${NC}"
echo ""

echo -e "${GREEN}🔄 Automated Tasks:${NC}"
echo -e "   • Daily backups at 2:00 AM"
echo -e "   • Health monitoring every 5 minutes"
echo -e "   • Log rotation (30-day retention)"
echo -e "   • SSL certificate auto-renewal"
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "200" ]; then
    echo -e "${GREEN}🎉 SUCCESS: Trade AI Platform v2 is now running!${NC}"
    echo -e "${GREEN}   Visit: https://${DOMAIN}${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Application may still be starting up.${NC}"
    echo -e "${YELLOW}   Wait a few minutes and check: ${SCRIPTS_DIR}/health-check.sh${NC}"
fi

echo ""
echo -e "${BLUE}For support: admin@gonxt.tech${NC}"
echo -e "${BLUE}Repository: https://github.com/Reshigan/trade-ai-platform-v2${NC}"
echo ""