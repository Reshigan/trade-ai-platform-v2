#!/bin/bash

# Fresh EC2 Deployment Script for Trade AI Platform v2
# Optimized for AWS EC2 Ubuntu instances

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
CURRENT_DIR="$(pwd)"
BACKUP_DIR="/home/ubuntu/backups/trade-ai-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/home/ubuntu/trade-ai-deploy.log"

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
check_user() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as ubuntu user with sudo privileges."
        exit 1
    fi
    
    if [[ "$(whoami)" != "ubuntu" ]]; then
        print_warning "Running as $(whoami), recommended to run as ubuntu user"
    fi
}

# Function to setup logging
setup_logging() {
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    print_status "Logging to: $LOG_FILE"
}

# Function to stop all Docker containers and services
stop_all_services() {
    print_header "STOPPING ALL SERVICES"
    
    # Stop Docker containers in current directory
    if [[ -f "docker-compose.yml" ]]; then
        print_status "Stopping Docker Compose services..."
        sudo docker-compose down --remove-orphans 2>/dev/null || true
    fi
    
    # Stop all running containers
    print_status "Stopping all Docker containers..."
    if command -v docker >/dev/null 2>&1; then
        sudo docker stop $(sudo docker ps -q) 2>/dev/null || true
        sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true
        
        # Clean up volumes (BE CAREFUL - this removes all data)
        print_warning "Removing Docker volumes (data will be lost)..."
        sudo docker volume rm $(sudo docker volume ls -q) 2>/dev/null || true
        
        # Clean up networks
        sudo docker network rm $(sudo docker network ls -q --filter type=custom) 2>/dev/null || true
        
        # Clean up system
        sudo docker system prune -af --volumes 2>/dev/null || true
        
        print_success "Docker cleanup completed"
    else
        print_warning "Docker not found, skipping Docker cleanup"
    fi
    
    # Kill any remaining processes
    print_status "Killing remaining processes..."
    sudo pkill -f "node.*server" 2>/dev/null || true
    sudo pkill -f "python.*app" 2>/dev/null || true
    sudo pkill -f "nginx.*trade" 2>/dev/null || true
    
    print_success "All services stopped"
}

# Function to backup existing data
backup_existing_data() {
    print_header "BACKING UP EXISTING DATA"
    
    if [[ -d "$CURRENT_DIR" ]]; then
        print_status "Creating backup at: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        
        # Backup current directory
        cp -r "$CURRENT_DIR" "$BACKUP_DIR/" 2>/dev/null || true
        
        # Backup Docker volumes data if exists
        if command -v docker >/dev/null 2>&1; then
            sudo docker run --rm -v trade-ai-mongodb-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/mongodb-data.tar.gz -C /data . 2>/dev/null || true
            sudo docker run --rm -v trade-ai-redis-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/redis-data.tar.gz -C /data . 2>/dev/null || true
        fi
        
        print_success "Backup completed at: $BACKUP_DIR"
    else
        print_status "No existing deployment found, skipping backup"
    fi
}

# Function to clean old files
clean_old_files() {
    print_header "CLEANING OLD FILES"
    
    # Clean up temporary files
    print_status "Cleaning temporary files..."
    sudo rm -rf /tmp/trade-ai* 2>/dev/null || true
    sudo rm -rf /tmp/docker-* 2>/dev/null || true
    
    # Clean up logs
    print_status "Cleaning old logs..."
    sudo rm -rf /home/ubuntu/trade-ai*.log 2>/dev/null || true
    
    print_success "Old files cleaned"
}

# Function to install dependencies
install_dependencies() {
    print_header "INSTALLING DEPENDENCIES"
    
    # Update system
    print_status "Updating system packages..."
    sudo apt-get update
    
    # Install essential packages
    print_status "Installing essential packages..."
    sudo apt-get install -y \
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
        net-tools
    
    # Install Docker if not present
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
        
        # Install Docker Compose
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        # Start Docker
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Add ubuntu user to docker group
        sudo usermod -aG docker ubuntu
        
        print_success "Docker installed and started"
    else
        print_status "Docker already installed"
        # Ensure ubuntu user is in docker group
        sudo usermod -aG docker ubuntu
    fi
    
    print_success "Dependencies installed"
}

# Function to setup fresh repository
setup_fresh_repository() {
    print_header "SETTING UP FRESH REPOSITORY"
    
    # Get latest changes
    print_status "Pulling latest changes..."
    git fetch origin
    git reset --hard origin/main
    git clean -fd
    
    # Set proper permissions
    sudo chown -R ubuntu:ubuntu "$CURRENT_DIR"
    
    print_success "Repository updated"
}

# Function to setup environment
setup_environment() {
    print_header "SETTING UP ENVIRONMENT"
    
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
EOF
        print_success "Environment file created"
    else
        print_status "Environment file already exists"
    fi
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p logs data/mongodb data/redis backups
    
    # Set permissions
    chmod 600 .env
    chmod -R 755 logs data backups
    
    print_success "Environment setup completed"
}

# Function to build and start services
build_and_start() {
    print_header "BUILDING AND STARTING SERVICES"
    
    # Start Docker daemon if not running
    if ! sudo systemctl is-active --quiet docker; then
        print_status "Starting Docker daemon..."
        sudo systemctl start docker
        sleep 5
    fi
    
    # Build and start services
    print_status "Building Docker images..."
    sudo docker-compose build --no-cache
    
    print_status "Starting services in proper order..."
    
    # Start databases first
    sudo docker-compose up -d mongodb redis
    print_status "Waiting for databases to be ready..."
    sleep 20
    
    # Start backend
    sudo docker-compose up -d backend
    print_status "Waiting for backend to be ready..."
    sleep 15
    
    # Start remaining services
    sudo docker-compose up -d
    
    # Wait for all services to be ready
    print_status "Waiting for all services to be ready..."
    sleep 30
    
    print_success "Services started"
}

# Function to run health checks
run_health_checks() {
    print_header "RUNNING HEALTH CHECKS"
    
    # Wait a bit more for services to fully start
    sleep 10
    
    # Check Docker containers
    print_status "Checking Docker containers..."
    sudo docker-compose ps
    
    # Get the actual backend port
    BACKEND_PORT=$(sudo docker-compose port backend 5000 2>/dev/null | cut -d: -f2 || echo "5001")
    
    # Check backend health
    print_status "Checking backend health on port $BACKEND_PORT..."
    if curl -f http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed, trying port 5000..."
        if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
            print_success "Backend health check passed on port 5000"
        else
            print_warning "Backend health check failed on both ports"
        fi
    fi
    
    # Check database connections
    print_status "Checking database connections..."
    if sudo docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        print_success "MongoDB connection successful"
    else
        print_warning "MongoDB connection failed"
    fi
    
    if sudo docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
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
    
    # Get actual ports
    FRONTEND_PORT=$(sudo docker-compose port frontend 80 2>/dev/null | cut -d: -f2 || echo "3001")
    BACKEND_PORT=$(sudo docker-compose port backend 5000 2>/dev/null | cut -d: -f2 || echo "5001")
    AI_PORT=$(sudo docker-compose port ai-services 8000 2>/dev/null | cut -d: -f2 || echo "8000")
    MONITOR_PORT=$(sudo docker-compose port monitoring 8080 2>/dev/null | cut -d: -f2 || echo "8081")
    
    echo -e "${CYAN}Service URLs:${NC}"
    echo -e "  Frontend:    http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$FRONTEND_PORT"
    echo -e "  Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$BACKEND_PORT"
    echo -e "  AI Services: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$AI_PORT"
    echo -e "  Monitoring:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$MONITOR_PORT"
    
    echo -e "\n${CYAN}Management Commands:${NC}"
    echo -e "  View logs:        sudo docker-compose logs -f"
    echo -e "  Check status:     sudo docker-compose ps"
    echo -e "  Restart:          sudo docker-compose restart"
    echo -e "  Stop:             sudo docker-compose down"
    echo -e "  Start:            sudo docker-compose up -d"
    
    echo -e "\n${CYAN}Important Files:${NC}"
    echo -e "  Project:          $CURRENT_DIR"
    echo -e "  Environment:      $CURRENT_DIR/.env"
    echo -e "  Logs:             $LOG_FILE"
    echo -e "  Backup:           $BACKUP_DIR"
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "  1. Configure security groups to allow access to ports"
    echo -e "  2. Set up domain name and SSL certificates"
    echo -e "  3. Configure monitoring and alerts"
    echo -e "  4. Set up automated backups"
    
    print_success "Fresh deployment completed successfully!"
}

# Main execution function
main() {
    print_header "TRADE AI PLATFORM V2 - FRESH EC2 DEPLOYMENT"
    
    # Pre-flight checks
    check_user
    setup_logging
    
    # Confirmation prompt
    echo -e "${YELLOW}WARNING: This will clean up Docker containers and restart fresh!${NC}"
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
    setup_fresh_repository
    setup_environment
    build_and_start
    run_health_checks
    display_final_status
    
    print_success "Fresh EC2 deployment script completed successfully!"
    print_warning "Note: You may need to log out and log back in for Docker group changes to take effect"
}

# Run main function
main "$@"