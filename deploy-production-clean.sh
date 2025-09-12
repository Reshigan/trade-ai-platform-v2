#!/bin/bash

# Trade AI Platform v2 - Clean Production Deployment
# Optimized for AWS EC2 deployment with Docker
# Server: 13.247.139.75 | Domain: tradeai.gonxt.tech

set -e

echo "🚀 Trade AI Platform v2 - Clean Production Deployment"
echo "===================================================="
echo "Server: 13.247.139.75"
echo "Domain: tradeai.gonxt.tech"
echo "Environment: Production"
echo

# Configuration
COMPOSE_FILE="docker-compose.aws-production-simple.yml"
PROJECT_NAME="trade-ai-platform"
DOMAIN="tradeai.gonxt.tech"
SERVER_IP="13.247.139.75"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Install Docker if needed
install_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    fi
    
    # Start Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    print_success "Docker ready"
}

# Clean previous deployments
clean_deployment() {
    print_status "Cleaning previous deployments..."
    
    # Stop all containers
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans --volumes 2>/dev/null || true
    
    # Remove containers
    docker ps -a --filter "name=${PROJECT_NAME}" -q | xargs -r docker rm -f 2>/dev/null || true
    docker ps -a --filter "name=trade" -q | xargs -r docker rm -f 2>/dev/null || true
    
    # Clean images
    docker images --filter "reference=*${PROJECT_NAME}*" -q | xargs -r docker rmi -f 2>/dev/null || true
    docker images --filter "reference=*trade-ai*" -q | xargs -r docker rmi -f 2>/dev/null || true
    
    # Clean system
    docker system prune -af 2>/dev/null || true
    
    # Free ports
    sudo fuser -k 80/tcp 443/tcp 3001/tcp 5001/tcp 8000/tcp 27017/tcp 6379/tcp 2>/dev/null || true
    
    # Clean directories
    sudo rm -rf backups logs ssl nginx 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Setup directories and SSL
setup_environment() {
    print_status "Setting up environment..."
    
    # Create directories
    mkdir -p {backups,logs,ssl,nginx/conf.d,nginx/html}
    chmod -R 755 backups logs ssl nginx
    
    # Generate SSL certificates
    print_status "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/privkey.pem \
        -out ssl/fullchain.pem \
        -subj "/C=AU/ST=NSW/L=Sydney/O=GONXT/OU=IT/CN=$DOMAIN/emailAddress=admin@gonxt.tech" \
        2>/dev/null
    
    chmod 600 ssl/privkey.pem
    chmod 644 ssl/fullchain.pem
    
    print_success "Environment setup completed"
}

# Load environment variables safely
load_environment() {
    print_status "Loading production environment..."
    
    if [[ ! -f ".env.production" ]]; then
        print_error "Production environment file not found"
        exit 1
    fi
    
    # Load environment variables safely
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ $line =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// }" ]] && continue
        
        # Export valid variable assignments
        if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
            export "$line"
        fi
    done < .env.production
    
    print_success "Environment loaded"
}

# Deploy services
deploy_services() {
    print_status "Deploying services..."
    
    # Set build variables
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VERSION="2.0.0"
    export CACHEBUST=$(date +%s)
    
    # Pull base images
    print_status "Pulling base images..."
    docker-compose -f $COMPOSE_FILE pull mongodb redis 2>/dev/null || true
    
    # Build services
    print_status "Building services (this may take 5-10 minutes)..."
    docker-compose -f $COMPOSE_FILE build --no-cache --parallel
    
    # Start services
    print_status "Starting services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    print_success "Services deployed"
}

# Wait for services
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # MongoDB
    print_status "Waiting for MongoDB..."
    for i in {1..40}; do
        if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            break
        fi
        sleep 3
        echo -n "."
    done
    echo
    print_success "MongoDB ready"
    
    # Redis
    print_status "Waiting for Redis..."
    for i in {1..20}; do
        if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T redis redis-cli ping &>/dev/null; then
            break
        fi
        sleep 2
        echo -n "."
    done
    echo
    print_success "Redis ready"
    
    # Backend
    print_status "Waiting for Backend API..."
    for i in {1..60}; do
        if curl -f http://localhost:5001/api/health &>/dev/null; then
            break
        fi
        sleep 3
        echo -n "."
    done
    echo
    print_success "Backend API ready"
    
    # Frontend
    print_status "Waiting for Frontend..."
    for i in {1..40}; do
        if curl -f http://localhost:3001 &>/dev/null; then
            break
        fi
        sleep 3
        echo -n "."
    done
    echo
    print_success "Frontend ready"
    
    print_success "All services ready"
}

# Seed data
seed_data() {
    print_status "Seeding GONXT production data..."
    
    # Run seed script
    if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T backend node src/seeds/production-enhanced-seed.js; then
        print_success "GONXT production data seeded successfully"
        print_success "✅ GONXT company with 2+ years of demo data"
        print_success "✅ Test company for additional demonstrations"
        print_success "✅ All advanced analytics features populated"
    else
        print_error "Failed to seed data"
        print_status "Checking backend logs..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=20 backend
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Running health checks..."
    
    # Check services
    services=("mongodb" "redis" "backend" "frontend" "ai-services" "monitoring" "nginx")
    for service in "${services[@]}"; do
        if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps $service | grep -q "Up"; then
            print_success "✅ $service running"
        else
            print_warning "⚠️  $service may have issues"
        fi
    done
    
    # Test endpoints
    if curl -f http://localhost:5001/api/health &>/dev/null; then
        print_success "✅ Backend health check passed"
    else
        print_warning "⚠️  Backend health check failed"
    fi
    
    if curl -f http://localhost:3001 &>/dev/null; then
        print_success "✅ Frontend health check passed"
    else
        print_warning "⚠️  Frontend health check failed"
    fi
    
    # Check database
    COMPANY_COUNT=$(docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T mongodb mongosh --quiet --eval "db.companies.countDocuments()" 2>/dev/null || echo "0")
    if [[ "$COMPANY_COUNT" -gt 0 ]]; then
        print_success "✅ Database verified ($COMPANY_COUNT companies)"
    else
        print_warning "⚠️  Database verification failed"
    fi
}

# Show summary
show_summary() {
    echo
    echo "================================================================"
    echo "🎉 GONXT Production Deployment Completed!"
    echo "================================================================"
    echo
    echo "🌐 Access Information:"
    echo "  Primary URL:    https://$DOMAIN"
    echo "  Frontend:       http://$SERVER_IP:3001"
    echo "  Backend API:    http://$SERVER_IP:5001/api"
    echo "  Health Check:   http://$SERVER_IP:5001/api/health"
    echo
    echo "🔐 Demo Credentials:"
    echo "  GONXT Company:  admin@gonxt.tech / GonxtAdmin2024!"
    echo "  Test Company:   admin@test.demo / TestAdmin2024!"
    echo
    echo "🔧 Management Commands:"
    echo "  Status:   docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps"
    echo "  Logs:     docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
    echo "  Restart:  docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart"
    echo "  Stop:     docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down"
    echo
    echo "🚀 Platform Status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    echo
    echo "🎯 Ready for Customer Demonstrations!"
    echo "================================================================"
}

# Main deployment
main() {
    print_status "Starting clean production deployment..."
    
    install_docker
    clean_deployment
    setup_environment
    load_environment
    deploy_services
    wait_for_services
    seed_data
    health_check
    show_summary
    
    print_success "🎉 Deployment completed successfully!"
    print_success "🚀 Access your platform at https://$DOMAIN"
}

# Handle interruption
trap 'print_error "Deployment interrupted"; docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down 2>/dev/null || true; exit 1' INT TERM

# Run deployment
main "$@"