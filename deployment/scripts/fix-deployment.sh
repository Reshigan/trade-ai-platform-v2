#!/bin/bash

# Quick fix for deployment script issues
# Run this if the main deployment script encounters directory creation issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_status "Creating missing directories..."

# Create all required directories
mkdir -p /opt/scripts
mkdir -p /opt/backups/trade-ai
mkdir -p /var/log/trade-ai
mkdir -p /opt/trade-ai-platform-v2

print_status "Setting proper permissions..."

# Set proper ownership
chown -R root:root /opt/scripts
chown -R tradeai:tradeai /opt/backups/trade-ai 2>/dev/null || echo "User 'tradeai' not found, will be created later"
chown -R tradeai:tradeai /var/log/trade-ai 2>/dev/null || echo "User 'tradeai' not found, will be created later"

print_status "Creating backup script..."

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

print_status "Creating systemd service (if not exists)..."

if [ ! -f "/etc/systemd/system/trade-ai.service" ]; then
    cat > /etc/systemd/system/trade-ai.service << EOF
[Unit]
Description=Trade AI Platform v2
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/trade-ai-platform-v2
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
TimeoutStartSec=0
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable trade-ai.service
    print_status "Systemd service created and enabled"
else
    print_status "Systemd service already exists"
fi

print_status "Setting up cron jobs..."

# Backup cron job
(crontab -l 2>/dev/null | grep -v backup-trade-ai.sh; echo "0 2 * * * /opt/scripts/backup-trade-ai.sh >> /var/log/trade-ai/backup.log 2>&1") | crontab -

# Monitoring cron job
(crontab -l 2>/dev/null | grep -v monitor-trade-ai.sh; echo "*/5 * * * * /opt/scripts/monitor-trade-ai.sh") | crontab -

print_status "Fix completed successfully!"
print_status "You can now continue with the deployment or restart the main deployment script."

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Continue with the main deployment script${NC}"
echo -e "${BLUE}2. Or manually run: cd /opt/trade-ai-platform-v2 && docker compose -f docker-compose.production.yml up -d${NC}"
echo -e "${BLUE}3. Check status: systemctl status trade-ai${NC}"