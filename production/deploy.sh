#!/bin/bash

# Trade AI Platform - Production Deployment Script
# This script deploys the Trade AI Platform in production mode

set -e

echo "=== TRADE AI PLATFORM - PRODUCTION DEPLOYMENT ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the production directory
PROD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$PROD_DIR/.." && pwd)"

echo -e "${BLUE}Production directory: $PROD_DIR${NC}"
echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

# Pre-deployment checks
echo ""
echo -e "${YELLOW}=== PRE-DEPLOYMENT CHECKS ===${NC}"

# Check required commands
REQUIRED_COMMANDS=("docker" "docker-compose" "openssl")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}❌ Error: $cmd is not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $cmd is available${NC}"
    fi
done

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker is running${NC}"
fi

# Check environment files
if [ ! -f "$PROD_DIR/.env.production" ]; then
    echo -e "${RED}❌ Error: .env.production not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ .env.production found${NC}"
fi

if [ ! -f "$PROD_DIR/.env.frontend.production" ]; then
    echo -e "${RED}❌ Error: .env.frontend.production not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ .env.frontend.production found${NC}"
fi

# Security check - warn about default passwords
echo ""
echo -e "${YELLOW}=== SECURITY CHECK ===${NC}"
if grep -q "CHANGE_THIS" "$PROD_DIR/.env.production"; then
    echo -e "${RED}⚠️  WARNING: Default passwords/secrets detected in .env.production${NC}"
    echo -e "${RED}   Please update all CHANGE_THIS values before continuing${NC}"
    read -p "Do you want to auto-generate secure passwords? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Generating secure passwords...${NC}"
        
        # Generate secure passwords
        MONGO_PASS=$(generate_password)
        REDIS_PASS=$(generate_password)
        JWT_SECRET=$(generate_jwt_secret)
        JWT_REFRESH_SECRET=$(generate_jwt_secret)
        SESSION_SECRET=$(generate_jwt_secret)
        
        # Update .env.production file
        sed -i.bak \
            -e "s/CHANGE_THIS_SECURE_PASSWORD_123!/$MONGO_PASS/g" \
            -e "s/CHANGE_THIS_REDIS_PASSWORD_456!/$REDIS_PASS/g" \
            -e "s/CHANGE_THIS_EXTREMELY_SECURE_JWT_SECRET_KEY_789_PRODUCTION/$JWT_SECRET/g" \
            -e "s/CHANGE_THIS_EXTREMELY_SECURE_REFRESH_SECRET_KEY_ABC_PRODUCTION/$JWT_REFRESH_SECRET/g" \
            -e "s/CHANGE_THIS_SESSION_SECRET_XYZ_PRODUCTION/$SESSION_SECRET/g" \
            "$PROD_DIR/.env.production"
        
        echo -e "${GREEN}✅ Secure passwords generated and updated${NC}"
        echo -e "${YELLOW}⚠️  Backup created: .env.production.bak${NC}"
    else
        echo -e "${RED}❌ Please update passwords manually before deployment${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No default passwords detected${NC}"
fi

# Domain configuration check
echo ""
echo -e "${YELLOW}=== DOMAIN CONFIGURATION ===${NC}"
if grep -q "your-domain.com" "$PROD_DIR/.env.production" || grep -q "your-domain.com" "$PROD_DIR/.env.frontend.production"; then
    echo -e "${RED}⚠️  WARNING: Default domain detected${NC}"
    read -p "Enter your production domain (e.g., tradeai.yourcompany.com): " DOMAIN
    if [ -n "$DOMAIN" ]; then
        sed -i.bak "s/your-domain.com/$DOMAIN/g" "$PROD_DIR/.env.production"
        sed -i.bak "s/your-domain.com/$DOMAIN/g" "$PROD_DIR/.env.frontend.production"
        echo -e "${GREEN}✅ Domain updated to: $DOMAIN${NC}"
    else
        echo -e "${RED}❌ Domain is required for production deployment${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Domain configuration looks good${NC}"
fi

# SSL Certificate check
echo ""
echo -e "${YELLOW}=== SSL CERTIFICATE CHECK ===${NC}"
if [ ! -d "$PROD_DIR/ssl" ]; then
    mkdir -p "$PROD_DIR/ssl"
fi

if [ ! -f "$PROD_DIR/ssl/cert.pem" ] || [ ! -f "$PROD_DIR/ssl/key.pem" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found${NC}"
    echo -e "${BLUE}Generating self-signed certificates for testing...${NC}"
    
    openssl req -x509 -newkey rsa:4096 -keyout "$PROD_DIR/ssl/key.pem" -out "$PROD_DIR/ssl/cert.pem" -days 365 -nodes \
        -subj "/C=AU/ST=NSW/L=Sydney/O=GONXT/CN=${DOMAIN:-localhost}"
    
    echo -e "${GREEN}✅ Self-signed certificates generated${NC}"
    echo -e "${YELLOW}⚠️  For production, replace with proper SSL certificates${NC}"
else
    echo -e "${GREEN}✅ SSL certificates found${NC}"
fi

# Deployment confirmation
echo ""
echo -e "${YELLOW}=== DEPLOYMENT CONFIRMATION ===${NC}"
echo -e "${BLUE}Ready to deploy Trade AI Platform with:${NC}"
echo -e "  • MongoDB with authentication"
echo -e "  • Redis with password protection"
echo -e "  • Backend API with JWT authentication"
echo -e "  • Frontend with production optimizations"
echo -e "  • AI Services"
echo -e "  • Monitoring dashboard"
echo -e "  • Nginx reverse proxy with SSL"
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Start deployment
echo ""
echo -e "${GREEN}=== STARTING DEPLOYMENT ===${NC}"

cd "$PROD_DIR"

# Stop any existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose -f docker-compose.production.yml down --remove-orphans 2>/dev/null || true

# Remove old images (optional)
read -p "Remove old Docker images to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Removing old images...${NC}"
    docker system prune -f
fi

# Build and start services
echo -e "${BLUE}Building and starting services...${NC}"
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo ""
echo -e "${YELLOW}=== SERVICE HEALTH CHECK ===${NC}"

SERVICES=("trade-ai-mongodb-prod" "trade-ai-redis-prod" "trade-ai-backend-prod" "trade-ai-frontend-prod")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = false ]; then
    echo -e "${RED}❌ Some services are not healthy. Check logs:${NC}"
    echo -e "${BLUE}docker-compose -f docker-compose.production.yml logs${NC}"
    exit 1
fi

# Initialize database
echo ""
echo -e "${YELLOW}=== DATABASE INITIALIZATION ===${NC}"
echo -e "${BLUE}Running production seed script...${NC}"

# Wait a bit more for MongoDB to be fully ready
sleep 10

# Run the seed script
docker exec trade-ai-mongodb-prod mongosh trade_ai_production --authenticationDatabase admin -u tradeai_admin -p "$(grep MONGO_PASSWORD .env.production | cut -d'=' -f2)" /docker-entrypoint-initdb.d/seed-production-data.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database initialized successfully${NC}"
else
    echo -e "${RED}❌ Database initialization failed${NC}"
    echo -e "${BLUE}Check MongoDB logs: docker logs trade-ai-mongodb-prod${NC}"
fi

# Final status check
echo ""
echo -e "${GREEN}=== DEPLOYMENT COMPLETE ===${NC}"
echo ""
echo -e "${GREEN}🎉 Trade AI Platform deployed successfully!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  • Frontend: https://${DOMAIN:-localhost}"
echo -e "  • API: https://${DOMAIN:-localhost}/api"
echo -e "  • Monitoring: https://${DOMAIN:-localhost}/monitoring"
echo ""
echo -e "${BLUE}Test Accounts:${NC}"
echo -e "  • Super Admin: superadmin@gonxt.tech / password123"
echo -e "  • Admin: admin@gonxt.tech / password123"
echo -e "  • Manager: manager@gonxt.tech / password123"
echo -e "  • KAM: kam@gonxt.tech / password123"
echo -e "  • Analyst: analyst@gonxt.tech / password123"
echo -e "  • Finance: finance@gonxt.tech / password123"
echo -e "  • Sales Rep: sales@gonxt.tech / password123"
echo -e "  • Viewer: viewer@gonxt.tech / password123"
echo ""
echo -e "${RED}🔒 IMPORTANT SECURITY TASKS:${NC}"
echo -e "  1. Change all default passwords immediately"
echo -e "  2. Configure proper SMTP settings"
echo -e "  3. Replace self-signed SSL certificates with proper ones"
echo -e "  4. Set up firewall rules"
echo -e "  5. Configure backup strategy"
echo -e "  6. Set up monitoring alerts"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs: docker-compose -f docker-compose.production.yml logs -f"
echo -e "  • Stop services: docker-compose -f docker-compose.production.yml down"
echo -e "  • Restart services: docker-compose -f docker-compose.production.yml restart"
echo -e "  • Update services: docker-compose -f docker-compose.production.yml up -d --build"
echo ""
echo -e "${GREEN}Deployment completed successfully! 🚀${NC}"