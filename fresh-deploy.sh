#!/bin/bash

# Fresh Server Deployment Script for Trade AI Platform v2
# This script completely cleans old files and starts fresh deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Reshigan/trade-ai-platform-v2.git"
PROJECT_NAME="trade-ai-platform-v2"
DEPLOY_DIR="/opt/trade-ai"
BACKUP_DIR="/opt/backups/trade-ai-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/trade-ai-deploy.log"

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}================================${NC}\n"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to create log file
setup_logging() {
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    print_status "Logging to: $LOG_FILE"
}

# Function to stop all Docker containers and services
stop_all_services() {
    print_header "STOPPING ALL SERVICES"
    
    # Stop Docker containers
    print_status "Stopping all Docker containers..."
    if command -v docker >/dev/null 2>&1; then
        # Stop all running containers
        docker stop $(docker ps -q) 2>/dev/null || true
        
        # Remove all containers
        docker rm $(docker ps -aq) 2>/dev/null || true
        
        # Remove all images (optional - uncomment if you want to remove images too)
        # docker rmi $(docker images -q) 2>/dev/null || true
        
        # Remove all volumes (BE CAREFUL - this removes all data)
        docker volume rm $(docker volume ls -q) 2>/dev/null || true
        
        # Remove all networks (except default ones)
        docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || true
        
        # Clean up Docker system
        docker system prune -af --volumes 2>/dev/null || true
        
        print_success "Docker cleanup completed"
    else
        print_warning "Docker not found, skipping Docker cleanup"
    fi
    
    # Stop systemd services if they exist
    print_status "Stopping systemd services..."
    systemctl stop trade-ai* 2>/dev/null || true
    systemctl disable trade-ai* 2>/dev/null || true
    
    # Kill any remaining processes
    print_status "Killing remaining processes..."
    pkill -f "trade-ai" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "python.*app" 2>/dev/null || true
    pkill -f "nginx.*trade" 2>/dev/null || true
    
    print_success "All services stopped"
}

# Function to backup existing data
backup_existing_data() {
    print_header "BACKING UP EXISTING DATA"
    
    if [[ -d "$DEPLOY_DIR" ]]; then
        print_status "Creating backup at: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        
        # Backup configuration files
        if [[ -d "$DEPLOY_DIR" ]]; then
            cp -r "$DEPLOY_DIR" "$BACKUP_DIR/" 2>/dev/null || true
        fi
        
        # Backup Docker volumes data if exists
        if command -v docker >/dev/null 2>&1; then
            docker run --rm -v trade-ai-mongodb-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/mongodb-data.tar.gz -C /data . 2>/dev/null || true
            docker run --rm -v trade-ai-redis-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/redis-data.tar.gz -C /data . 2>/dev/null || true
        fi
        
        # Backup logs
        if [[ -d "/var/log/trade-ai" ]]; then
            cp -r "/var/log/trade-ai" "$BACKUP_DIR/logs" 2>/dev/null || true
        fi
        
        print_success "Backup completed at: $BACKUP_DIR"
    else
        print_status "No existing deployment found, skipping backup"
    fi
}

# Function to clean old files
clean_old_files() {
    print_header "CLEANING OLD FILES"
    
    # Remove deployment directory
    if [[ -d "$DEPLOY_DIR" ]]; then
        print_status "Removing old deployment directory: $DEPLOY_DIR"
        rm -rf "$DEPLOY_DIR"
        print_success "Old deployment directory removed"
    fi
    
    # Clean up systemd service files
    print_status "Removing systemd service files..."
    rm -f /etc/systemd/system/trade-ai*.service
    systemctl daemon-reload
    
    # Clean up nginx configurations
    print_status "Removing nginx configurations..."
    rm -f /etc/nginx/sites-available/trade-ai*
    rm -f /etc/nginx/sites-enabled/trade-ai*
    
    # Clean up log directories
    print_status "Cleaning log directories..."
    rm -rf /var/log/trade-ai*
    
    # Clean up temporary files
    print_status "Cleaning temporary files..."
    rm -rf /tmp/trade-ai*
    rm -rf /tmp/docker-*
    
    # Clean up user home directories (if any)
    if id "trade-ai" &>/dev/null; then
        print_status "Removing trade-ai user..."
        userdel -r trade-ai 2>/dev/null || true
    fi
    
    # Clean up cron jobs
    print_status "Removing cron jobs..."
    crontab -l | grep -v "trade-ai" | crontab - 2>/dev/null || true
    
    print_success "Old files cleaned"
}

# Function to install dependencies
install_dependencies() {
    print_header "INSTALLING DEPENDENCIES"
    
    # Update system
    print_status "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    
    # Install essential packages
    print_status "Installing essential packages..."
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
        htop \
        nano \
        vim \
        tree \
        jq \
        net-tools \
        ufw
    
    # Install Docker if not present
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        
        # Install Docker Compose
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        # Start Docker
        systemctl start docker
        systemctl enable docker
        
        print_success "Docker installed and started"
    else
        print_status "Docker already installed"
    fi
    
    # Install Node.js (latest LTS)
    if ! command -v node >/dev/null 2>&1; then
        print_status "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
        apt-get install -y nodejs
        print_success "Node.js installed: $(node --version)"
    else
        print_status "Node.js already installed: $(node --version)"
    fi
    
    # Install Python and pip
    if ! command -v python3 >/dev/null 2>&1; then
        print_status "Installing Python..."
        apt-get install -y python3 python3-pip python3-venv
        print_success "Python installed: $(python3 --version)"
    else
        print_status "Python already installed: $(python3 --version)"
    fi
    
    print_success "Dependencies installed"
}

# Function to clone repository
clone_repository() {
    print_header "CLONING REPOSITORY"
    
    # Create deployment directory
    mkdir -p "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    
    # Clone repository
    print_status "Cloning repository from: $REPO_URL"
    git clone "$REPO_URL" .
    
    # Set proper permissions
    chown -R root:root "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"
    
    print_success "Repository cloned to: $DEPLOY_DIR"
}

# Function to setup environment
setup_environment() {
    print_header "SETTING UP ENVIRONMENT"
    
    cd "$DEPLOY_DIR"
    
    # Create environment file if it doesn't exist
    if [[ ! -f ".env" ]]; then
        print_status "Creating environment file..."
        cat > .env << EOF
# Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://mongodb:27017/tradeai
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# API Configuration
API_BASE_URL=http://localhost:5000/api

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api

# AI Services Configuration
AI_SERVICES_URL=http://ai-services:8000

# Monitoring Configuration
MONITORING_PORT=8080

# SSL Configuration (for production)
SSL_CERT_PATH=/etc/ssl/certs/trade-ai.crt
SSL_KEY_PATH=/etc/ssl/private/trade-ai.key

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
EOF
        print_success "Environment file created"
    else
        print_status "Environment file already exists"
    fi
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p logs
    mkdir -p data/mongodb
    mkdir -p data/redis
    mkdir -p backups
    mkdir -p ssl
    
    # Set permissions
    chmod 600 .env
    chmod -R 755 logs data backups
    
    print_success "Environment setup completed"
}

# Function to build and start services
build_and_start() {
    print_header "BUILDING AND STARTING SERVICES"
    
    cd "$DEPLOY_DIR"
    
    # Start Docker daemon if not running
    if ! systemctl is-active --quiet docker; then
        print_status "Starting Docker daemon..."
        systemctl start docker
        sleep 5
    fi
    
    # Build and start services
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    docker-compose ps
    
    print_success "Services started"
}

# Function to setup firewall
setup_firewall() {
    print_header "SETTING UP FIREWALL"
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application ports
    ufw allow 3000/tcp  # Frontend
    ufw allow 5000/tcp  # Backend API
    ufw allow 8000/tcp  # AI Services
    ufw allow 8080/tcp  # Monitoring
    
    # Enable firewall
    ufw --force enable
    
    print_success "Firewall configured"
}

# Function to create systemd service
create_systemd_service() {
    print_header "CREATING SYSTEMD SERVICE"
    
    cat > /etc/systemd/system/trade-ai.service << EOF
[Unit]
Description=Trade AI Platform v2
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable trade-ai.service
    
    print_success "Systemd service created and enabled"
}

# Function to setup monitoring and logging
setup_monitoring() {
    print_header "SETTING UP MONITORING AND LOGGING"
    
    # Create log rotation configuration
    cat > /etc/logrotate.d/trade-ai << EOF
/var/log/trade-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f $DEPLOY_DIR/docker-compose.yml restart > /dev/null 2>&1 || true
    endscript
}
EOF
    
    # Create monitoring script
    cat > /usr/local/bin/trade-ai-monitor.sh << 'EOF'
#!/bin/bash
# Trade AI Platform Monitoring Script

DEPLOY_DIR="/opt/trade-ai"
LOG_FILE="/var/log/trade-ai/monitor.log"

mkdir -p "$(dirname "$LOG_FILE")"

echo "$(date): Checking Trade AI Platform status..." >> "$LOG_FILE"

cd "$DEPLOY_DIR"

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "$(date): Some containers are down, restarting..." >> "$LOG_FILE"
    docker-compose up -d >> "$LOG_FILE" 2>&1
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$(date): WARNING: Disk usage is ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 80 ]; then
    echo "$(date): WARNING: Memory usage is ${MEM_USAGE}%" >> "$LOG_FILE"
fi

echo "$(date): Monitoring check completed" >> "$LOG_FILE"
EOF
    
    chmod +x /usr/local/bin/trade-ai-monitor.sh
    
    # Add cron job for monitoring
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/trade-ai-monitor.sh") | crontab -
    
    print_success "Monitoring and logging setup completed"
}

# Function to run health checks
run_health_checks() {
    print_header "RUNNING HEALTH CHECKS"
    
    cd "$DEPLOY_DIR"
    
    # Wait a bit more for services to fully start
    sleep 10
    
    # Check Docker containers
    print_status "Checking Docker containers..."
    docker-compose ps
    
    # Check backend health
    print_status "Checking backend health..."
    if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend
    print_status "Checking frontend..."
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend is not accessible"
    fi
    
    # Check AI services
    print_status "Checking AI services..."
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "AI services health check passed"
    else
        print_warning "AI services health check failed"
    fi
    
    # Check database connections
    print_status "Checking database connections..."
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        print_success "MongoDB connection successful"
    else
        print_warning "MongoDB connection failed"
    fi
    
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis connection successful"
    else
        print_warning "Redis connection failed"
    fi
    
    print_success "Health checks completed"
}

# Function to display final status
display_final_status() {
    print_header "DEPLOYMENT COMPLETED"
    
    echo -e "${GREEN}Trade AI Platform v2 has been successfully deployed!${NC}\n"
    
    echo -e "${CYAN}Service URLs:${NC}"
    echo -e "  Frontend:    http://$(hostname -I | awk '{print $1}'):3000"
    echo -e "  Backend API: http://$(hostname -I | awk '{print $1}'):5000"
    echo -e "  AI Services: http://$(hostname -I | awk '{print $1}'):8000"
    echo -e "  Monitoring:  http://$(hostname -I | awk '{print $1}'):8080"
    echo -e "  Nginx:       http://$(hostname -I | awk '{print $1}'):80"
    
    echo -e "\n${CYAN}Management Commands:${NC}"
    echo -e "  Start services:   systemctl start trade-ai"
    echo -e "  Stop services:    systemctl stop trade-ai"
    echo -e "  Restart services: systemctl restart trade-ai"
    echo -e "  View logs:        docker-compose -f $DEPLOY_DIR/docker-compose.yml logs -f"
    echo -e "  Check status:     docker-compose -f $DEPLOY_DIR/docker-compose.yml ps"
    
    echo -e "\n${CYAN}Important Files:${NC}"
    echo -e "  Deployment:       $DEPLOY_DIR"
    echo -e "  Environment:      $DEPLOY_DIR/.env"
    echo -e "  Logs:             /var/log/trade-ai/"
    echo -e "  Backup:           $BACKUP_DIR"
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "  1. Configure SSL certificates in $DEPLOY_DIR/ssl/"
    echo -e "  2. Update DNS records to point to this server"
    echo -e "  3. Configure domain-specific settings in .env"
    echo -e "  4. Set up automated backups"
    echo -e "  5. Configure monitoring alerts"
    
    print_success "Fresh deployment completed successfully!"
}

# Main execution function
main() {
    print_header "TRADE AI PLATFORM V2 - FRESH DEPLOYMENT"
    
    # Pre-flight checks
    check_root
    setup_logging
    
    # Confirmation prompt
    echo -e "${YELLOW}WARNING: This will completely remove all existing Trade AI Platform data and start fresh!${NC}"
    echo -e "${YELLOW}A backup will be created at: $BACKUP_DIR${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
    
    # Execute deployment steps
    stop_all_services
    backup_existing_data
    clean_old_files
    install_dependencies
    clone_repository
    setup_environment
    build_and_start
    setup_firewall
    create_systemd_service
    setup_monitoring
    run_health_checks
    display_final_status
    
    print_success "Fresh deployment script completed successfully!"
}

# Run main function
main "$@"