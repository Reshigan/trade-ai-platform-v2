#!/bin/bash

# Trade AI Platform - Simple Production Deployment Script
# Server: 13.247.139.75
# Domain: tradeai.gonxt.tech

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="tradeai.gonxt.tech"
SERVER_IP="13.247.139.75"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if Docker is running
check_docker() {
    log "Checking Docker..."
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
    fi
    log "Docker is running"
}

# Stop existing containers
stop_containers() {
    log "Stopping existing containers..."
    if docker compose -f docker-compose.simple.yml ps -q | grep -q .; then
        docker compose -f docker-compose.simple.yml down
        log "Existing containers stopped"
    else
        info "No existing containers to stop"
    fi
}

# Build and start containers
start_containers() {
    log "Building and starting containers..."
    
    # Build containers
    docker compose -f docker-compose.simple.yml build --no-cache
    
    # Start containers
    docker compose -f docker-compose.simple.yml up -d
    
    log "Containers started"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        info "Health check attempt $attempt/$max_attempts"
        
        # Check MongoDB
        if docker compose -f docker-compose.simple.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            log "✓ MongoDB is ready"
            mongodb_ready=true
        else
            mongodb_ready=false
        fi
        
        # Check Backend API
        if curl -f http://localhost:5001/api/health &>/dev/null; then
            log "✓ Backend API is ready"
            backend_ready=true
        else
            backend_ready=false
        fi
        
        # Check Frontend
        if curl -f http://localhost:3000/health.json &>/dev/null; then
            log "✓ Frontend is ready"
            frontend_ready=true
        else
            frontend_ready=false
        fi
        
        # Check if all services are ready
        if [[ "$mongodb_ready" == true && "$backend_ready" == true && "$frontend_ready" == true ]]; then
            log "All services are ready!"
            break
        else
            info "Waiting for services to be ready..."
            sleep 10
            ((attempt++))
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Services failed to become ready within timeout"
    fi
}

# Test login functionality
test_login() {
    log "Testing login functionality..."
    
    # Test login with admin credentials
    response=$(curl -s -X POST http://localhost:5001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@testcompany.com","password":"password"}')
    
    if echo "$response" | grep -q '"success":true'; then
        log "✓ Login test successful"
    else
        error "Login test failed: $response"
    fi
}

# Display service status
show_status() {
    log "Service Status:"
    docker compose -f docker-compose.simple.yml ps
    
    echo ""
    log "Service URLs:"
    echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}Backend API:${NC} http://localhost:5001/api"
    echo -e "${BLUE}Health Check:${NC} http://localhost:5001/api/health"
    echo -e "${BLUE}MongoDB:${NC} localhost:27017"
    
    echo ""
    log "Test Credentials:"
    echo -e "${BLUE}Admin:${NC} admin@testcompany.com / password"
    echo -e "${BLUE}Manager:${NC} manager@testcompany.com / password"
    echo -e "${BLUE}User:${NC} user@testcompany.com / password"
    echo -e "${BLUE}Super Admin:${NC} superadmin@tradeai.com / password"
}

# Create nginx configuration for production
create_nginx_config() {
    log "Creating nginx configuration for production..."
    
    cat > nginx-production.conf << EOF
server {
    listen 80;
    server_name $DOMAIN $SERVER_IP;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN $SERVER_IP;
    
    # SSL configuration (to be configured with real certificates)
    ssl_certificate /etc/ssl/certs/tradeai.crt;
    ssl_certificate_key /etc/ssl/private/tradeai.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Frontend routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle React Router
        try_files \$uri \$uri/ @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    log "Nginx configuration created: nginx-production.conf"
}

# Main deployment function
main() {
    log "Starting Trade AI Platform Simple Deployment..."
    
    # Check Docker
    check_docker
    
    # Stop existing containers
    stop_containers
    
    # Start containers
    start_containers
    
    # Wait for services
    wait_for_services
    
    # Test login
    test_login
    
    # Create nginx config
    create_nginx_config
    
    # Show status
    show_status
    
    log "Trade AI Platform deployment completed successfully!"
    
    echo ""
    echo -e "${GREEN}=== DEPLOYMENT SUMMARY ===${NC}"
    echo -e "${BLUE}Status:${NC} All services are running and healthy"
    echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}Backend API:${NC} http://localhost:5001/api"
    echo -e "${BLUE}Domain:${NC} $DOMAIN (configure DNS and SSL)"
    echo -e "${BLUE}Server IP:${NC} $SERVER_IP"
    echo ""
    echo -e "${YELLOW}Next Steps for Production:${NC}"
    echo "1. Copy nginx-production.conf to /etc/nginx/sites-available/$DOMAIN"
    echo "2. Enable the site: ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
    echo "3. Get SSL certificates: certbot --nginx -d $DOMAIN"
    echo "4. Configure DNS to point $DOMAIN to $SERVER_IP"
    echo "5. Test the production setup"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo "- View logs: docker compose -f docker-compose.simple.yml logs -f"
    echo "- Restart: docker compose -f docker-compose.simple.yml restart"
    echo "- Stop: docker compose -f docker-compose.simple.yml down"
    echo ""
}

# Run main function
main "$@"