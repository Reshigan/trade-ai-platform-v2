#!/bin/bash

# AWS Production Deployment Script for Trade AI Platform v2
# This script deploys the complete production environment with all services

set -e

echo "🚀 Starting AWS Production Deployment for Trade AI Platform v2"
echo "================================================================"

# Configuration
COMPOSE_FILE="docker-compose.aws-production.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOGS_DIR="./logs"
DATA_DIR="/opt/trade-ai/data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is not recommended for production."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
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
    
    print_success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create data directories
    sudo mkdir -p "$DATA_DIR"/{mongodb,mongodb-config,redis,ai-models,ai-data,monitoring}
    sudo mkdir -p "$BACKUP_DIR"/{mongodb,redis,backend}
    sudo mkdir -p "$LOGS_DIR"/{nginx,backend,ai-services,monitoring,backup,healthcheck}
    
    # Set proper permissions
    sudo chown -R $USER:$USER "$BACKUP_DIR" "$LOGS_DIR"
    sudo chmod -R 755 "$BACKUP_DIR" "$LOGS_DIR"
    
    # Create nginx directories
    mkdir -p nginx/conf.d nginx/html
    
    print_success "Directories created successfully"
}

# Generate SSL certificates (self-signed for development, use Let's Encrypt for production)
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    if [[ ! -d "ssl" ]]; then
        mkdir -p ssl
    fi
    
    if [[ ! -f "ssl/privkey.pem" ]] || [[ ! -f "ssl/fullchain.pem" ]]; then
        print_warning "SSL certificates not found. Generating self-signed certificates..."
        print_warning "For production, please use proper SSL certificates from a CA or Let's Encrypt"
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/privkey.pem \
            -out ssl/fullchain.pem \
            -subj "/C=AU/ST=NSW/L=Sydney/O=GONXT/OU=IT/CN=tradeai.gonxt.tech"
        
        chmod 600 ssl/privkey.pem
        chmod 644 ssl/fullchain.pem
        
        print_success "Self-signed SSL certificates generated"
    else
        print_success "SSL certificates found"
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and deploying services..."
    
    # Load environment variables
    export $(cat $ENV_FILE | grep -v '^#' | xargs)
    
    # Set build variables
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VERSION="2.0.0"
    export CACHEBUST=$(date +%s)
    
    # Pull latest images
    print_status "Pulling latest base images..."
    docker-compose -f $COMPOSE_FILE pull mongodb redis
    
    # Build custom images
    print_status "Building custom images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "Services deployed successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    timeout=60
    while ! docker-compose -f $COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [[ $timeout -le 0 ]]; then
            print_error "MongoDB failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "MongoDB is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while ! docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping &>/dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [[ $timeout -le 0 ]]; then
            print_error "Redis failed to start within 30 seconds"
            exit 1
        fi
    done
    print_success "Redis is ready"
    
    # Wait for Backend
    print_status "Waiting for Backend API..."
    timeout=120
    while ! curl -f http://localhost:5001/api/health &>/dev/null; do
        sleep 5
        timeout=$((timeout - 5))
        if [[ $timeout -le 0 ]]; then
            print_error "Backend API failed to start within 120 seconds"
            exit 1
        fi
    done
    print_success "Backend API is ready"
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    timeout=60
    while ! curl -f http://localhost:3001 &>/dev/null; do
        sleep 3
        timeout=$((timeout - 3))
        if [[ $timeout -le 0 ]]; then
            print_error "Frontend failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Frontend is ready"
    
    print_success "All services are ready"
}

# Seed production data
seed_production_data() {
    print_status "Seeding production data..."
    
    # Run production seed script
    docker-compose -f $COMPOSE_FILE exec -T backend node src/seeds/production-enhanced-seed.js
    
    if [[ $? -eq 0 ]]; then
        print_success "Production data seeded successfully"
    else
        print_error "Failed to seed production data"
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check all services
    services=("mongodb" "redis" "backend" "frontend" "ai-services" "monitoring" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose -f $COMPOSE_FILE ps $service | grep -q "Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running properly"
            docker-compose -f $COMPOSE_FILE logs --tail=20 $service
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
    
    print_success "Health checks completed"
}

# Display deployment summary
show_deployment_summary() {
    echo
    echo "================================================================"
    echo "🎉 AWS Production Deployment Completed Successfully!"
    echo "================================================================"
    echo
    echo "Services Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo
    echo "Access URLs:"
    echo "  Frontend:    http://localhost:3001"
    echo "  Backend API: http://localhost:5001/api"
    echo "  AI Services: http://localhost:8000"
    echo "  Monitoring:  http://localhost:8081"
    echo
    echo "Admin Credentials:"
    echo "  GONXT Admin: admin@gonxt.tech / GonxtAdmin2024!"
    echo "  Test Admin:  admin@test.demo / TestAdmin2024!"
    echo
    echo "Database:"
    echo "  MongoDB: localhost:27017"
    echo "  Redis:   localhost:6379"
    echo
    echo "Logs Location: $LOGS_DIR"
    echo "Backups Location: $BACKUP_DIR"
    echo "Data Location: $DATA_DIR"
    echo
    echo "To stop services: docker-compose -f $COMPOSE_FILE down"
    echo "To view logs: docker-compose -f $COMPOSE_FILE logs -f [service_name]"
    echo
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    
    check_permissions
    check_prerequisites
    create_directories
    setup_ssl
    deploy_services
    wait_for_services
    seed_production_data
    run_health_checks
    show_deployment_summary
    
    print_success "Deployment completed successfully!"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"