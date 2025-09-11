#!/bin/bash

# Trade AI Platform - Production Deployment Script
# Server: 13.247.139.75
# Domain: tradeai.gonxt.tech

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="tradeai.gonxt.tech"
SERVER_IP="13.247.139.75"
PROJECT_DIR="/opt/trade-ai-platform"
BACKUP_DIR="/opt/backups/trade-ai"
LOG_FILE="/var/log/trade-ai-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check available disk space (minimum 10GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 10485760 ]]; then
        warning "Less than 10GB disk space available. Consider freeing up space."
    fi
    
    # Check available memory (minimum 2GB)
    available_memory=$(free -m | awk 'NR==2{print $7}')
    if [[ $available_memory -lt 2048 ]]; then
        warning "Less than 2GB memory available. Performance may be affected."
    fi
    
    log "System requirements check completed"
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    apt-get update -y
    
    # Install required packages
    apt-get install -y \
        curl \
        wget \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        logrotate \
        htop \
        unzip
    
    log "System dependencies installed"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (be careful not to lock yourself out)
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow specific ports for development (remove in production)
    ufw allow 3000/tcp comment "Frontend dev"
    ufw allow 5000/tcp comment "Backend API"
    ufw allow 27017/tcp comment "MongoDB"
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured"
}

# Setup fail2ban
setup_fail2ban() {
    log "Setting up fail2ban..."
    
    # Create nginx jail configuration
    cat > /etc/fail2ban/jail.d/nginx.conf << EOF
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF
    
    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    log "Fail2ban configured"
}

# Create project directories
create_directories() {
    log "Creating project directories..."
    
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p /var/log/trade-ai
    mkdir -p /etc/nginx/ssl
    mkdir -p /opt/trade-ai-platform/logs
    mkdir -p /opt/trade-ai-platform/uploads
    mkdir -p /opt/trade-ai-platform/ssl
    
    log "Project directories created"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Check if certificates already exist
    if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
        info "SSL certificates already exist for $DOMAIN"
        # Copy to nginx ssl directory
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "/etc/nginx/ssl/tradeai.crt"
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "/etc/nginx/ssl/tradeai.key"
    else
        warning "SSL certificates not found. You'll need to set them up manually."
        info "To get SSL certificates, run:"
        info "certbot --nginx -d $DOMAIN"
        
        # Create self-signed certificates for testing
        log "Creating self-signed certificates for testing..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "/etc/nginx/ssl/tradeai.key" \
            -out "/etc/nginx/ssl/tradeai.crt" \
            -subj "/C=AU/ST=NSW/L=Sydney/O=TradeAI/CN=$DOMAIN"
    fi
    
    # Set proper permissions
    chmod 600 /etc/nginx/ssl/tradeai.key
    chmod 644 /etc/nginx/ssl/tradeai.crt
    
    log "SSL certificates configured"
}

# Deploy application
deploy_application() {
    log "Deploying Trade AI Platform..."
    
    # Navigate to project directory
    cd "$PROJECT_DIR"
    
    # Stop existing containers if running
    if [[ -f "docker-compose.production.yml" ]]; then
        info "Stopping existing containers..."
        docker-compose -f docker-compose.production.yml down || true
    fi
    
    # Pull latest images and build
    log "Building application containers..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Start services
    log "Starting application services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_services_health
    
    log "Application deployed successfully"
}

# Check services health
check_services_health() {
    log "Checking services health..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        info "Health check attempt $attempt/$max_attempts"
        
        # Check MongoDB
        if docker-compose -f docker-compose.production.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            log "✓ MongoDB is healthy"
        else
            warning "✗ MongoDB is not ready"
        fi
        
        # Check Backend API
        if curl -f http://localhost:5000/api/health &>/dev/null; then
            log "✓ Backend API is healthy"
        else
            warning "✗ Backend API is not ready"
        fi
        
        # Check Frontend
        if curl -f http://localhost:3001/health.json &>/dev/null; then
            log "✓ Frontend is healthy"
        else
            warning "✗ Frontend is not ready"
        fi
        
        # Check if all services are healthy
        if docker-compose -f docker-compose.production.yml ps | grep -q "unhealthy"; then
            warning "Some services are still unhealthy, waiting..."
            sleep 10
            ((attempt++))
        else
            log "All services are healthy!"
            break
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Services failed to become healthy within timeout"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    cat > /usr/local/bin/trade-ai-monitor.sh << 'EOF'
#!/bin/bash
# Trade AI Platform Monitoring Script

LOG_FILE="/var/log/trade-ai/monitor.log"
PROJECT_DIR="/opt/trade-ai-platform"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

cd "$PROJECT_DIR"

# Check if containers are running
if ! docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    log "ERROR: Some containers are not running"
    # Restart containers
    docker-compose -f docker-compose.production.yml up -d
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 80 ]]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [[ $MEMORY_USAGE -gt 80 ]]; then
    log "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi

log "Monitoring check completed"
EOF

    chmod +x /usr/local/bin/trade-ai-monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/trade-ai-monitor.sh") | crontab -
    
    log "Monitoring configured"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/trade-ai << EOF
/var/log/trade-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}

/opt/trade-ai-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
    
    log "Log rotation configured"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > /usr/local/bin/trade-ai-backup.sh << 'EOF'
#!/bin/bash
# Trade AI Platform Backup Script

BACKUP_DIR="/opt/backups/trade-ai"
PROJECT_DIR="/opt/trade-ai-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup MongoDB
docker-compose -f "$PROJECT_DIR/docker-compose.production.yml" exec -T mongodb mongodump --out /tmp/backup
docker cp $(docker-compose -f "$PROJECT_DIR/docker-compose.production.yml" ps -q mongodb):/tmp/backup "$BACKUP_DIR/$DATE/mongodb"

# Backup application files
tar -czf "$BACKUP_DIR/$DATE/application.tar.gz" -C "$PROJECT_DIR" .

# Backup nginx configuration
cp -r /etc/nginx "$BACKUP_DIR/$DATE/"

# Backup SSL certificates
cp -r /etc/letsencrypt "$BACKUP_DIR/$DATE/" 2>/dev/null || true

# Remove backups older than 30 days
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true

echo "Backup completed: $BACKUP_DIR/$DATE"
EOF

    chmod +x /usr/local/bin/trade-ai-backup.sh
    
    # Add to crontab (daily backup at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/trade-ai-backup.sh") | crontab -
    
    log "Backup script created"
}

# Main deployment function
main() {
    log "Starting Trade AI Platform deployment..."
    
    # Check if running as root
    check_root
    
    # Check system requirements
    check_requirements
    
    # Install dependencies
    install_dependencies
    
    # Setup security
    setup_firewall
    setup_fail2ban
    
    # Create directories
    create_directories
    
    # Setup SSL
    setup_ssl
    
    # Deploy application
    deploy_application
    
    # Setup monitoring
    setup_monitoring
    
    # Setup log rotation
    setup_log_rotation
    
    # Create backup script
    create_backup_script
    
    log "Trade AI Platform deployment completed successfully!"
    
    echo ""
    echo -e "${GREEN}=== DEPLOYMENT SUMMARY ===${NC}"
    echo -e "${BLUE}Domain:${NC} https://$DOMAIN"
    echo -e "${BLUE}Server IP:${NC} $SERVER_IP"
    echo -e "${BLUE}Project Directory:${NC} $PROJECT_DIR"
    echo -e "${BLUE}Backup Directory:${NC} $BACKUP_DIR"
    echo -e "${BLUE}Log File:${NC} $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Configure DNS to point $DOMAIN to $SERVER_IP"
    echo "2. Get SSL certificates: certbot --nginx -d $DOMAIN"
    echo "3. Test the application: https://$DOMAIN"
    echo "4. Monitor logs: tail -f $LOG_FILE"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo "- Check services: docker-compose -f $PROJECT_DIR/docker-compose.production.yml ps"
    echo "- View logs: docker-compose -f $PROJECT_DIR/docker-compose.production.yml logs"
    echo "- Restart services: docker-compose -f $PROJECT_DIR/docker-compose.production.yml restart"
    echo "- Backup: /usr/local/bin/trade-ai-backup.sh"
    echo ""
}

# Run main function
main "$@"