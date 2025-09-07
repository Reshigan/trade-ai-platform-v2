#!/bin/bash

# Trade AI Docker Deployment Script for macOS
# Diplomat South Africa Edition

set -e

echo "🚀 Trade AI Docker Deployment - Diplomat South Africa"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed and running${NC}"
echo ""

# Function to wait for service
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "Waiting for $service to be ready..."
    while ! nc -z localhost $port &> /dev/null; do
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED} Failed!${NC}"
            echo "Service $service did not start within expected time."
            return 1
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    echo -e "${GREEN} Ready!${NC}"
    return 0
}

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true
echo ""

# Build images
echo "🏗️  Building Docker images..."
echo "This may take a few minutes on first run..."
docker-compose build --no-cache
echo -e "${GREEN}✅ Images built successfully${NC}"
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose up -d
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
wait_for_service "MongoDB" 27017
wait_for_service "Redis" 6379
wait_for_service "Backend API" 5000
wait_for_service "Frontend" 3000
echo ""

# Check service health
echo "🏥 Checking service health..."
sleep 5

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
else
    echo -e "${RED}❌ MongoDB health check failed${NC}"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
fi

# Check Backend API
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "${RED}❌ Backend API health check failed${NC}"
fi

# Check Frontend
if curl -s http://localhost:3000 | grep -q "Trade AI"; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
fi

echo ""

# Generate test data
echo "📊 Generating test data for Diplomat South Africa..."
echo "This will create a year's worth of realistic FMCG data..."

# Install dependencies for data generation
docker-compose exec -T backend npm install @faker-js/faker moment

# Run data generation script
docker-compose exec -T backend node /app/scripts/generate-diplomat-data.js

echo ""
echo -e "${GREEN}✅ Test data generated successfully!${NC}"
echo ""

# Display access information
echo "🎉 Trade AI is now running!"
echo "=========================="
echo ""
echo "📱 Access Points:"
echo "   Frontend UI: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/docs"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin: admin@diplomat-sa.co.za / Admin@2024"
echo "   Trade Manager: john.vandermerwe@diplomat-sa.co.za / Trade@2024"
echo "   Sales Manager: sarah.naidoo@diplomat-sa.co.za / Sales@2024"
echo "   Finance Manager: thabo.molefe@diplomat-sa.co.za / Finance@2024"
echo ""
echo "🛠️  Useful Commands:"
echo "   View logs: docker-compose logs -f [service]"
echo "   Stop all: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   View stats: docker stats"
echo ""
echo "📊 Database Access:"
echo "   MongoDB: mongodb://admin:tradeai2024@localhost:27017"
echo "   Redis: redis://:tradeai2024@localhost:6379"
echo ""
echo -e "${YELLOW}💡 Tip: Use MongoDB Compass or RedisInsight for GUI access${NC}"
echo ""

# Open browser
echo "Opening Trade AI in your browser..."
sleep 2
open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 in your browser"

echo ""
echo "Happy trading! 🚀"