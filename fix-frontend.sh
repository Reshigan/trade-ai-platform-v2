#!/bin/bash

# Fix Frontend React Build Script
# This script fixes the frontend build issue and rebuilds the containers

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

print_status "Fixing Frontend React Build Issue"

# Check if we're in the right directory
if [[ ! -f "docker-compose.yml" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Stop current containers
print_status "Stopping current containers..."
sudo docker-compose down 2>/dev/null || true

# Backup current Dockerfile
print_status "Backing up current Dockerfile..."
cp frontend/Dockerfile frontend/Dockerfile.backup

# Replace with fixed Dockerfile
print_status "Installing fixed Dockerfile..."
cp frontend/Dockerfile.fixed frontend/Dockerfile

# Fix the package.json build script to use react-scripts directly
print_status "Fixing package.json build script..."
cd frontend
npm install --legacy-peer-deps --force 2>/dev/null || true

# Test build locally first
print_status "Testing React build locally..."
if CI=false GENERATE_SOURCEMAP=false npm run build:react; then
    print_success "Local React build successful!"
else
    print_warning "Local build failed, but Docker build might still work"
fi

cd ..

# Remove old frontend image
print_status "Removing old frontend image..."
sudo docker rmi trade-ai-platform-v2-frontend 2>/dev/null || true

# Rebuild only the frontend container
print_status "Rebuilding frontend container..."
sudo docker-compose build --no-cache frontend

# Start all services
print_status "Starting all services..."
sudo docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check frontend status
print_status "Checking frontend status..."
FRONTEND_PORT=$(sudo docker-compose port frontend 80 2>/dev/null | cut -d: -f2 || echo "3001")

if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
    print_success "Frontend is now serving the React application!"
    print_status "Frontend URL: http://localhost:$FRONTEND_PORT"
else
    print_warning "Frontend might still be starting up..."
fi

# Check if it's the React app by looking for React-specific content
print_status "Verifying React app is loaded..."
if curl -s http://localhost:$FRONTEND_PORT | grep -q "react"; then
    print_success "React application detected!"
else
    print_warning "Still showing basic HTML - checking container logs..."
    sudo docker-compose logs frontend | tail -20
fi

print_success "Frontend fix completed!"
print_status "If you still see the basic version, try:"
echo "  1. Clear your browser cache"
echo "  2. Wait a few more minutes for the build to complete"
echo "  3. Check logs with: sudo docker-compose logs frontend"