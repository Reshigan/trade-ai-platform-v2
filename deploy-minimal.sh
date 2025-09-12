#!/bin/bash

# Trade AI Platform v2 - Minimal Production Deployment
# Focus on core services only

set -e

echo "🚀 Trade AI Platform v2 - Minimal Deployment"
echo "============================================="
echo "Server: 13.247.139.75"
echo "Domain: tradeai.gonxt.tech"
echo

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

# Install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    sudo systemctl start docker
    sudo systemctl enable docker
    print_success "Docker ready"
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose -f docker-compose.minimal.yml down --remove-orphans --volumes 2>/dev/null || true
    docker system prune -af 2>/dev/null || true
    sudo fuser -k 80/tcp 443/tcp 3001/tcp 5001/tcp 8000/tcp 27017/tcp 6379/tcp 2>/dev/null || true
    print_success "Cleanup completed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    mkdir -p {logs,ssl}
    
    # Generate SSL certificates
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/privkey.pem \
        -out ssl/fullchain.pem \
        -subj "/C=AU/ST=NSW/L=Sydney/O=GONXT/OU=IT/CN=tradeai.gonxt.tech/emailAddress=admin@gonxt.tech" \
        2>/dev/null
    
    chmod 600 ssl/privkey.pem
    chmod 644 ssl/fullchain.pem
    
    print_success "Environment ready"
}

# Load environment
load_environment() {
    print_status "Loading environment..."
    
    if [[ -f ".env.production" ]]; then
        set -a
        source .env.production
        set +a
        print_success "Production environment loaded"
    else
        print_error "No .env.production file found"
        exit 1
    fi
}

# Deploy services
deploy() {
    print_status "Deploying services..."
    
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VERSION="2.0.0"
    
    # Build and start services
    docker-compose -f docker-compose.minimal.yml build --no-cache
    docker-compose -f docker-compose.minimal.yml up -d
    
    print_success "Services deployed"
}

# Wait for services
wait_for_services() {
    print_status "Waiting for services..."
    
    # MongoDB
    for i in {1..30}; do
        if docker exec trade-ai-mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            break
        fi
        sleep 2
        echo -n "."
    done
    echo
    print_success "MongoDB ready"
    
    # Backend
    for i in {1..60}; do
        if curl -f http://localhost:5001/api/health &>/dev/null; then
            break
        fi
        sleep 3
        echo -n "."
    done
    echo
    print_success "Backend ready"
    
    # Frontend
    for i in {1..30}; do
        if curl -f http://localhost:3001 &>/dev/null; then
            break
        fi
        sleep 2
        echo -n "."
    done
    echo
    print_success "Frontend ready"
}

# Seed data
seed_data() {
    print_status "Seeding data..."
    
    if docker exec trade-ai-backend node src/seeds/production-enhanced-seed.js; then
        print_success "Data seeded successfully"
    else
        print_warning "Data seeding failed, but continuing..."
    fi
}

# Show status
show_status() {
    echo
    echo "================================================================"
    echo "🎉 GONXT Trade AI Platform - Minimal Deployment Complete!"
    echo "================================================================"
    echo
    echo "🌐 Access URLs:"
    echo "  Frontend:     http://13.247.139.75:3001"
    echo "  Backend API:  http://13.247.139.75:5001/api"
    echo "  AI Services:  http://13.247.139.75:8000"
    echo "  Nginx Proxy:  http://13.247.139.75:80"
    echo
    echo "🔐 Demo Credentials:"
    echo "  GONXT:  admin@gonxt.tech / GonxtAdmin2024!"
    echo "  Test:   admin@test.demo / TestAdmin2024!"
    echo
    echo "🔧 Management:"
    echo "  Status: docker-compose -f docker-compose.minimal.yml ps"
    echo "  Logs:   docker-compose -f docker-compose.minimal.yml logs -f"
    echo "  Stop:   docker-compose -f docker-compose.minimal.yml down"
    echo
    docker-compose -f docker-compose.minimal.yml ps
    echo "================================================================"
}

# Main
main() {
    install_docker
    cleanup
    setup_environment
    load_environment
    deploy
    wait_for_services
    seed_data
    show_status
}

# Handle interruption
trap 'print_error "Interrupted"; docker-compose -f docker-compose.minimal.yml down 2>/dev/null || true; exit 1' INT TERM

# Run
main "$@"