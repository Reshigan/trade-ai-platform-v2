#!/bin/bash

# Quick Reset Script for Trade AI Platform v2 (Development/Testing)
# This is a lighter version for development environments

set -e

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

# Configuration
PROJECT_DIR="$(pwd)"
REPO_URL="https://github.com/Reshigan/trade-ai-platform-v2.git"

print_status "Quick Reset for Trade AI Platform v2"
print_warning "This will stop all containers and clean up Docker resources"

# Confirmation
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Cancelled by user"
    exit 1
fi

# Stop and clean Docker
print_status "Stopping and cleaning Docker containers..."
if command -v docker >/dev/null 2>&1; then
    # Stop all containers
    docker stop $(docker ps -q) 2>/dev/null || true
    
    # Remove containers
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove volumes (data will be lost!)
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    # Clean system
    docker system prune -af --volumes 2>/dev/null || true
    
    print_success "Docker cleanup completed"
else
    print_warning "Docker not found"
fi

# Clean project directory
print_status "Cleaning project directory..."
if [[ -d "trade-ai-platform-v2" ]]; then
    rm -rf trade-ai-platform-v2
    print_success "Old project directory removed"
fi

# Clone fresh repository
print_status "Cloning fresh repository..."
git clone "$REPO_URL"
cd trade-ai-platform-v2

# Create environment file
print_status "Creating environment file..."
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/tradeai
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
API_BASE_URL=http://localhost:5000/api
REACT_APP_API_URL=http://localhost:5000/api
AI_SERVICES_URL=http://ai-services:8000
MONITORING_PORT=8080
EOF

# Start Docker daemon if needed
if ! pgrep -x "dockerd" > /dev/null; then
    print_status "Starting Docker daemon..."
    sudo dockerd > /tmp/docker.log 2>&1 &
    sleep 5
fi

# Build and start services
print_status "Building and starting services..."
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Wait for services
print_status "Waiting for services to start..."
sleep 30

# Check status
print_status "Checking service status..."
sudo docker-compose ps

# Health checks
print_status "Running health checks..."
sleep 10

if curl -f http://localhost:5001/api/health >/dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed"
fi

print_success "Quick reset completed!"
print_status "Services should be available at:"
echo "  Frontend: http://localhost:3001"
echo "  Backend:  http://localhost:5001"
echo "  AI:       http://localhost:8000"
echo "  Monitor:  http://localhost:8081"

print_status "Use 'sudo docker-compose logs -f' to view logs"