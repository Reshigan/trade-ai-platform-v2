#!/bin/bash

# Trade AI Platform v2 - AWS Production Deployment Script
# This script performs a complete clean deployment on AWS with GONXT demo data

set -e

echo "🚀 Trade AI Platform v2 - AWS Production Deployment"
echo "=================================================="

# Configuration
COMPOSE_FILE="docker-compose.aws-production.yml"
ENV_FILE=".env.production"
PROJECT_NAME="trade-ai-platform"
BACKUP_DIR="./backups"
LOGS_DIR="./logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on AWS EC2
check_aws_environment() {
    print_status "Checking AWS environment..."
    
    # Check if running on EC2
    if curl -s --max-time 3 http://169.254.169.254/latest/meta-data/instance-id &>/dev/null; then
        INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
        INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
        AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
        PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
        
        print_success "Running on AWS EC2 Instance: $INSTANCE_ID ($INSTANCE_TYPE) in $AZ"
        print_success "Public IP: $PUBLIC_IP"
    else
        print_warning "Not running on AWS EC2. Proceeding with local deployment."
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        print_success "Docker installed. Please log out and back in, then run this script again."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    fi
    
    # Check if .env.production exists
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error "Production environment file ($ENV_FILE) not found."
        exit 1
    fi
    
    # Check if docker-compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        print_error "Docker Compose file ($COMPOSE_FILE) not found."
        exit 1
    fi
    
    # Start Docker service if not running
    if ! sudo systemctl is-active --quiet docker; then
        print_status "Starting Docker service..."
        sudo systemctl start docker
        sudo systemctl enable docker
    fi
    
    print_success "Prerequisites check passed"
}

# Clean up previous deployments
cleanup_previous_deployments() {
    print_status "Cleaning up previous deployments..."
    
    # Stop and remove all containers for this project
    print_status "Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans || true
    
    # Remove all containers with project name
    CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" -q)
    if [[ ! -z "$CONTAINERS" ]]; then
        print_status "Removing existing containers..."
        docker rm -f $CONTAINERS || true
    fi
    
    # Remove project-specific images
    IMAGES=$(docker images --filter "reference=*${PROJECT_NAME}*" -q)
    if [[ ! -z "$IMAGES" ]]; then
        print_status "Removing project images..."
        docker rmi -f $IMAGES || true
    fi
    
    # Remove unused volumes (be careful with this)
    print_status "Removing unused Docker volumes..."
    docker volume prune -f || true
    
    # Remove unused networks
    print_status "Removing unused Docker networks..."
    docker network prune -f || true
    
    # Clean up system
    print_status "Cleaning up Docker system..."
    docker system prune -f || true
    
    # Remove old backup and log directories
    if [[ -d "$BACKUP_DIR" ]]; then
        print_status "Cleaning old backups..."
        sudo rm -rf "$BACKUP_DIR"
    fi
    
    if [[ -d "$LOGS_DIR" ]]; then
        print_status "Cleaning old logs..."
        sudo rm -rf "$LOGS_DIR"
    fi
    
    # Remove SSL certificates (will be regenerated)
    if [[ -d "ssl" ]]; then
        print_status "Removing old SSL certificates..."
        rm -rf ssl
    fi
    
    print_success "Previous deployments cleaned up"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create backup and log directories
    mkdir -p "$BACKUP_DIR"/{mongodb,redis,backend}
    mkdir -p "$LOGS_DIR"/{nginx,backend,ai-services,monitoring,backup,healthcheck}
    
    # Create nginx directories
    mkdir -p nginx/conf.d nginx/html
    
    # Create SSL directory
    mkdir -p ssl
    
    # Set proper permissions
    chmod -R 755 "$BACKUP_DIR" "$LOGS_DIR" ssl nginx
    
    print_success "Directories created successfully"
}

# Generate SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Generate self-signed certificates for production demo
    print_status "Generating self-signed SSL certificates for demo..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/privkey.pem \
        -out ssl/fullchain.pem \
        -subj "/C=AU/ST=NSW/L=Sydney/O=GONXT/OU=IT/CN=tradeai.gonxt.tech/emailAddress=admin@gonxt.tech"
    
    chmod 600 ssl/privkey.pem
    chmod 644 ssl/fullchain.pem
    
    print_success "SSL certificates generated"
    print_warning "For production, replace with proper SSL certificates from Let's Encrypt or your CA"
}

# Update environment for AWS
configure_aws_environment() {
    print_status "Configuring AWS environment..."
    
    # Get public IP if on EC2
    if [[ ! -z "$PUBLIC_IP" ]]; then
        print_status "Updating environment with AWS public IP: $PUBLIC_IP"
        
        # Update .env.production with public IP
        sed -i "s/SERVER_IP=.*/SERVER_IP=$PUBLIC_IP/" $ENV_FILE || true
        sed -i "s/DOMAIN_NAME=.*/DOMAIN_NAME=$PUBLIC_IP/" $ENV_FILE || true
    fi
    
    # Load environment variables
    export $(cat $ENV_FILE | grep -v '^#' | xargs)
    
    print_success "AWS environment configured"
}

# Build and deploy services
deploy_services() {
    print_status "Building and deploying services..."
    
    # Set build variables
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VERSION="2.0.0"
    export CACHEBUST=$(date +%s)
    
    # Pull latest base images
    print_status "Pulling latest base images..."
    docker-compose -f $COMPOSE_FILE pull mongodb redis || true
    
    # Build custom images with no cache
    print_status "Building custom images..."
    docker-compose -f $COMPOSE_FILE build --no-cache --parallel
    
    # Start services
    print_status "Starting services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    print_success "Services deployed successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    timeout=120
    while ! docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; do
        sleep 3
        timeout=$((timeout - 3))
        if [[ $timeout -le 0 ]]; then
            print_error "MongoDB failed to start within 120 seconds"
            docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs mongodb
            exit 1
        fi
        echo -n "."
    done
    echo
    print_success "MongoDB is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=60
    while ! docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T redis redis-cli ping &>/dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [[ $timeout -le 0 ]]; then
            print_error "Redis failed to start within 60 seconds"
            docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs redis
            exit 1
        fi
        echo -n "."
    done
    echo
    print_success "Redis is ready"
    
    # Wait for Backend
    print_status "Waiting for Backend API..."
    timeout=180
    while ! curl -f http://localhost:5001/api/health &>/dev/null; do
        sleep 5
        timeout=$((timeout - 5))
        if [[ $timeout -le 0 ]]; then
            print_error "Backend API failed to start within 180 seconds"
            docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs backend
            exit 1
        fi
        echo -n "."
    done
    echo
    print_success "Backend API is ready"
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    timeout=120
    while ! curl -f http://localhost:3001 &>/dev/null; do
        sleep 3
        timeout=$((timeout - 3))
        if [[ $timeout -le 0 ]]; then
            print_error "Frontend failed to start within 120 seconds"
            docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs frontend
            exit 1
        fi
        echo -n "."
    done
    echo
    print_success "Frontend is ready"
    
    print_success "All services are ready"
}

# Seed production data with GONXT demo
seed_production_data() {
    print_status "Seeding production data with GONXT demo..."
    
    # Run production seed script
    print_status "Running comprehensive production seed script..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T backend node src/seeds/production-enhanced-seed.js
    
    if [[ $? -eq 0 ]]; then
        print_success "Production data seeded successfully"
        print_success "GONXT demo company created with 2+ years of historical data"
        print_success "Test company created for additional demonstrations"
    else
        print_error "Failed to seed production data"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs backend
        exit 1
    fi
}

# Run comprehensive health checks
run_health_checks() {
    print_status "Running comprehensive health checks..."
    
    # Check all services
    services=("mongodb" "redis" "backend" "frontend" "ai-services" "monitoring" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps $service | grep -q "Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running properly"
            docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=20 $service
        fi
    done
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    # Test health endpoint
    if curl -f http://localhost:5001/api/health &>/dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
    fi
    
    # Test frontend
    if curl -f http://localhost:3001 &>/dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
    fi
    
    # Test database connection
    if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T mongodb mongosh --eval "db.companies.countDocuments()" &>/dev/null; then
        print_success "Database connection test passed"
    else
        print_error "Database connection test failed"
    fi
    
    print_success "Health checks completed"
}

# Display deployment summary
show_deployment_summary() {
    echo
    echo "================================================================"
    echo "🎉 AWS Production Deployment Completed Successfully!"
    echo "================================================================"
    echo
    echo "🏢 GONXT Demo Environment Ready for Prospective Customers"
    echo
    echo "Services Status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    echo
    echo "🌐 Access URLs:"
    if [[ ! -z "$PUBLIC_IP" ]]; then
        echo "  Frontend:    http://$PUBLIC_IP:3001"
        echo "  Backend API: http://$PUBLIC_IP:5001/api"
        echo "  AI Services: http://$PUBLIC_IP:8000"
        echo "  Monitoring:  http://$PUBLIC_IP:8081"
    else
        echo "  Frontend:    http://localhost:3001"
        echo "  Backend API: http://localhost:5001/api"
        echo "  AI Services: http://localhost:8000"
        echo "  Monitoring:  http://localhost:8081"
    fi
    echo
    echo "🔐 Demo Credentials for Prospective Customers:"
    echo "  GONXT Company:"
    echo "    Email:    admin@gonxt.tech"
    echo "    Password: GonxtAdmin2024!"
    echo "    Features: All advanced analytics features enabled"
    echo
    echo "  Test Company:"
    echo "    Email:    admin@test.demo"
    echo "    Password: TestAdmin2024!"
    echo "    Features: Complete demo environment"
    echo
    echo "📊 Demo Data Includes:"
    echo "  • 2+ years of comprehensive historical data"
    echo "  • 10 major Australian retail customers"
    echo "  • 25 products across 5 categories"
    echo "  • 15 promotional campaigns"
    echo "  • Advanced analytics with ML predictions"
    echo "  • Trading terms and profitability analysis"
    echo "  • Marketing budget allocation examples"
    echo "  • AI chat with company-specific insights"
    echo
    echo "🗄️ Database:"
    echo "  MongoDB: localhost:27017 (trade-ai database)"
    echo "  Redis:   localhost:6379"
    echo
    echo "📁 Important Directories:"
    echo "  Logs:    $LOGS_DIR"
    echo "  Backups: $BACKUP_DIR"
    echo "  SSL:     ssl/"
    echo
    echo "🔧 Management Commands:"
    echo "  Stop:     docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down"
    echo "  Restart:  docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart"
    echo "  Logs:     docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f [service]"
    echo "  Status:   docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps"
    echo
    echo "🚀 Ready for Customer Demonstrations!"
    echo "================================================================"
}

# Main deployment process
main() {
    echo "Starting AWS production deployment process..."
    echo
    
    check_aws_environment
    check_prerequisites
    cleanup_previous_deployments
    create_directories
    setup_ssl
    configure_aws_environment
    deploy_services
    wait_for_services
    seed_production_data
    run_health_checks
    show_deployment_summary
    
    print_success "AWS Production Deployment completed successfully!"
    print_success "GONXT demo environment is ready for prospective customers!"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down; exit 1' INT TERM

# Run main function
main "$@"