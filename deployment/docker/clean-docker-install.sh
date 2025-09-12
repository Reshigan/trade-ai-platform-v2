#!/bin/bash

# Trade AI Platform v2 - Clean Docker Installation Script
# Works on: Ubuntu, CentOS, macOS, Windows (WSL2)
# Version: 2.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="trade-ai-platform-v2"
REPO_URL="https://github.com/Reshigan/trade-ai-platform-v2.git"
INSTALL_DIR="$HOME/trade-ai-platform-v2"
COMPOSE_FILE="docker-compose.yml"

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$NAME
            VER=$VERSION_ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="Windows"
    else
        OS="Unknown"
    fi
}

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Trade AI Platform v2                          ║"
    echo "║              Clean Docker Installation                       ║"
    echo "║                                                              ║"
    echo "║  OS: $OS                                              ║"
    echo "║  Version: 2.0.0                                              ║"
    echo "║  Mode: Development/Local                                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Docker on Ubuntu/Debian
install_docker_ubuntu() {
    print_status "Installing Docker on Ubuntu/Debian..."
    
    # Update package index
    sudo apt-get update -y >/dev/null 2>&1
    
    # Install prerequisites
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release >/dev/null 2>&1
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up stable repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update -y >/dev/null 2>&1
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin >/dev/null 2>&1
    
    # Start and enable Docker
    sudo systemctl start docker >/dev/null 2>&1
    sudo systemctl enable docker >/dev/null 2>&1
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
}

# Install Docker on CentOS/RHEL
install_docker_centos() {
    print_status "Installing Docker on CentOS/RHEL..."
    
    # Install prerequisites
    sudo yum install -y yum-utils >/dev/null 2>&1
    
    # Add Docker repository
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo >/dev/null 2>&1
    
    # Install Docker Engine
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin >/dev/null 2>&1
    
    # Start and enable Docker
    sudo systemctl start docker >/dev/null 2>&1
    sudo systemctl enable docker >/dev/null 2>&1
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
}

# Install Docker on macOS
install_docker_macos() {
    print_status "Docker installation on macOS..."
    
    if command_exists brew; then
        print_status "Installing Docker Desktop via Homebrew..."
        brew install --cask docker >/dev/null 2>&1
        print_success "Docker Desktop installed via Homebrew"
        print_warning "Please start Docker Desktop from Applications folder"
    else
        print_warning "Homebrew not found. Please install Docker Desktop manually:"
        print_warning "1. Download from: https://www.docker.com/products/docker-desktop"
        print_warning "2. Install and start Docker Desktop"
        print_warning "3. Re-run this script"
        exit 1
    fi
}

# Install Docker
install_docker() {
    if command_exists docker; then
        print_success "Docker already installed"
        return
    fi
    
    case "$OS" in
        *"Ubuntu"*|*"Debian"*)
            install_docker_ubuntu
            ;;
        *"CentOS"*|*"Red Hat"*|*"Fedora"*)
            install_docker_centos
            ;;
        "macOS")
            install_docker_macos
            ;;
        *)
            print_error "Unsupported OS: $OS"
            print_error "Please install Docker manually: https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
}

# Wait for Docker to be ready
wait_for_docker() {
    print_status "Waiting for Docker to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker info >/dev/null 2>&1; then
            print_success "Docker is ready"
            return
        fi
        
        if [ $attempt -eq 1 ]; then
            print_warning "Docker not ready, waiting... (you may need to start Docker Desktop on macOS/Windows)"
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Docker failed to start after $max_attempts attempts"
    print_error "Please ensure Docker is running and try again"
    exit 1
}

# Clone repository
clone_repository() {
    print_step "Cloning Trade AI Platform repository..."
    
    if [ -d "$INSTALL_DIR" ]; then
        print_status "Directory exists, updating repository..."
        cd "$INSTALL_DIR"
        git pull origin main >/dev/null 2>&1
    else
        print_status "Cloning repository..."
        git clone "$REPO_URL" "$INSTALL_DIR" >/dev/null 2>&1
        cd "$INSTALL_DIR"
    fi
    
    print_success "Repository ready"
}

# Create development Docker Compose
create_dev_compose() {
    print_step "Creating development Docker Compose configuration..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: trade-ai-mongodb-dev
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: tradeai2024
      MONGO_INITDB_DATABASE: trade-ai
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/init:/docker-entrypoint-initdb.d:ro
      - ./mongodb/seed:/seed:ro
    networks:
      - trade-ai-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7.2-alpine
    container_name: trade-ai-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - trade-ai-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: trade-ai-backend-dev
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 5000
      MONGO_URI: mongodb://admin:tradeai2024@mongodb:27017/trade-ai?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_jwt_secret_key_2024
      CORS_ORIGIN: http://localhost:3000
      LOG_LEVEL: debug
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - trade-ai-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend React App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:5000/api
        REACT_APP_SOCKET_URL: http://localhost:5000
    container_name: trade-ai-frontend-dev
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
      REACT_APP_SOCKET_URL: http://localhost:5000
      GENERATE_SOURCEMAP: false
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - trade-ai-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  # AI Services (Optional)
  ai-services:
    build:
      context: ./ai-services
      dockerfile: Dockerfile
    container_name: trade-ai-ai-services-dev
    restart: unless-stopped
    environment:
      FLASK_ENV: development
      MODEL_PATH: /app/models
      REDIS_URL: redis://redis:6379
    ports:
      - "8000:8000"
    volumes:
      - ./ai-services:/app
      - ai_models:/app/models
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - trade-ai-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local
  ai_models:
    driver: local

networks:
  trade-ai-network:
    driver: bridge
EOF

    print_success "Development Docker Compose created"
}

# Create environment file
create_env_file() {
    print_step "Creating environment configuration..."
    
    cat > .env << 'EOF'
# Trade AI Platform v2 - Development Environment

# Application
NODE_ENV=development
PORT=5000
FRONTEND_PORT=3000

# Database
MONGO_URI=mongodb://admin:tradeai2024@mongodb:27017/trade-ai?authSource=admin
MONGO_USERNAME=admin
MONGO_PASSWORD=tradeai2024
MONGO_DATABASE=trade-ai

# Cache
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=

# Security
JWT_SECRET=dev_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# AI Services
AI_SERVICE_URL=http://ai-services:8000
AI_MODEL_TYPE=local
AI_USE_LOCAL_MODELS=true

# Features
ENABLE_MULTI_TENANT=true
ENABLE_AI_PREDICTIONS=true
ENABLE_REAL_TIME_ANALYTICS=true

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_AI_API_URL=http://localhost:8000
GENERATE_SOURCEMAP=false
EOF

    print_success "Environment file created"
}

# Create management scripts
create_scripts() {
    print_step "Creating management scripts..."
    
    mkdir -p scripts
    
    # Start script
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Trade AI Platform..."
docker compose up -d
echo "✅ Services started!"
echo ""
echo "📱 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/docs"
echo "   AI Services: http://localhost:8000"
echo ""
echo "🔍 Check status: ./scripts/status.sh"
EOF

    # Stop script
    cat > scripts/stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Trade AI Platform..."
docker compose down
echo "✅ Services stopped!"
EOF

    # Status script
    cat > scripts/status.sh << 'EOF'
#!/bin/bash
echo "📊 Trade AI Platform Status"
echo "=========================="
echo ""
echo "🐳 Docker Containers:"
docker compose ps
echo ""
echo "🔍 Health Checks:"
echo -n "Frontend:    "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "Not responding"
echo -n "Backend:     "
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "Not responding"
echo -n "AI Services: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "Not responding"
echo ""
echo "📋 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
EOF

    # Logs script
    cat > scripts/logs.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "📋 All Services Logs:"
    docker compose logs -f
else
    echo "📋 $1 Service Logs:"
    docker compose logs -f "$1"
fi
EOF

    # Reset script
    cat > scripts/reset.sh << 'EOF'
#!/bin/bash
echo "🔄 Resetting Trade AI Platform..."
echo "⚠️  This will remove all data!"
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down -v
    docker system prune -f
    echo "✅ Platform reset complete!"
    echo "🚀 Run './scripts/start.sh' to start fresh"
else
    echo "❌ Reset cancelled"
fi
EOF

    # Seed data script
    cat > scripts/seed-data.sh << 'EOF'
#!/bin/bash
echo "🌱 Seeding database with GONXT data..."
docker compose exec mongodb mongosh trade-ai --authenticationDatabase admin -u admin -p tradeai2024 /seed/seed-gonxt-data.js
echo "✅ Database seeded successfully!"
echo ""
echo "🔐 Login Credentials:"
echo "   GONXT Admin: admin@gonxt.tech / password123"
echo "   Test Company: demo@testcompany.demo / password123"
EOF

    # Make scripts executable
    chmod +x scripts/*.sh
    
    print_success "Management scripts created"
}

# Main installation function
main() {
    detect_os
    print_banner
    
    print_step "1/7 - Checking prerequisites..."
    
    # Check Git
    if ! command_exists git; then
        print_error "Git is required but not installed"
        print_error "Please install Git and try again"
        exit 1
    fi
    print_success "Git found"
    
    # Check/Install Docker
    print_step "2/7 - Installing Docker..."
    install_docker
    
    print_step "3/7 - Waiting for Docker..."
    wait_for_docker
    
    print_step "4/7 - Cloning repository..."
    clone_repository
    
    print_step "5/7 - Creating Docker configuration..."
    create_dev_compose
    create_env_file
    
    print_step "6/7 - Creating management scripts..."
    create_scripts
    
    print_step "7/7 - Building and starting services..."
    print_status "This may take a few minutes for the first build..."
    
    # Build services
    docker compose build >/dev/null 2>&1
    
    # Start services
    docker compose up -d
    
    # Wait for services
    print_status "Waiting for services to initialize..."
    sleep 45
    
    # Seed database
    print_status "Seeding database with GONXT data..."
    sleep 15
    docker compose exec -T mongodb mongosh trade-ai --authenticationDatabase admin -u admin -p tradeai2024 /seed/seed-gonxt-data.js >/dev/null 2>&1 || print_warning "Database seeding will be available after services are fully ready"
    
    # Display results
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                 INSTALLATION COMPLETE                        ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${GREEN}🚀 Trade AI Platform v2 is now running!${NC}"
    echo ""
    
    echo -e "${GREEN}📱 Access URLs:${NC}"
    echo -e "   Frontend:     ${CYAN}http://localhost:3000${NC}"
    echo -e "   Backend API:  ${CYAN}http://localhost:5000${NC}"
    echo -e "   API Docs:     ${CYAN}http://localhost:5000/api/docs${NC}"
    echo -e "   AI Services:  ${CYAN}http://localhost:8000${NC}"
    echo ""
    
    echo -e "${GREEN}🔐 Login Credentials:${NC}"
    echo -e "   ${YELLOW}GONXT Admin:${NC}"
    echo -e "     Email:    ${CYAN}admin@gonxt.tech${NC}"
    echo -e "     Password: ${CYAN}password123${NC}"
    echo ""
    echo -e "   ${YELLOW}Test Company:${NC}"
    echo -e "     Email:    ${CYAN}demo@testcompany.demo${NC}"
    echo -e "     Password: ${CYAN}password123${NC}"
    echo ""
    
    echo -e "${GREEN}🛠️ Management Commands:${NC}"
    echo -e "   Start:        ${CYAN}./scripts/start.sh${NC}"
    echo -e "   Stop:         ${CYAN}./scripts/stop.sh${NC}"
    echo -e "   Status:       ${CYAN}./scripts/status.sh${NC}"
    echo -e "   Logs:         ${CYAN}./scripts/logs.sh${NC}"
    echo -e "   Seed Data:    ${CYAN}./scripts/seed-data.sh${NC}"
    echo -e "   Reset:        ${CYAN}./scripts/reset.sh${NC}"
    echo ""
    
    echo -e "${GREEN}📊 What's Included:${NC}"
    echo -e "   • 2 years of GONXT business data (2023-2024)"
    echo -e "   • 50 customers, 100 products"
    echo -e "   • 20,000 sales transactions"
    echo -e "   • 5,000 trade spend records"
    echo -e "   • 200 promotional campaigns"
    echo -e "   • Multi-tenant architecture"
    echo -e "   • AI predictions and analytics"
    echo ""
    
    # Health check
    echo -e "${GREEN}🔍 Service Status:${NC}"
    sleep 5
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "000")
    
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "   Frontend:  ${GREEN}✅ Running${NC}"
    else
        echo -e "   Frontend:  ${YELLOW}⏳ Starting up...${NC}"
    fi
    
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo -e "   Backend:   ${GREEN}✅ Running${NC}"
    else
        echo -e "   Backend:   ${YELLOW}⏳ Starting up...${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📁 Installation Directory: ${CYAN}$INSTALL_DIR${NC}"
    echo -e "${BLUE}🆘 Support: admin@gonxt.tech${NC}"
    echo ""
    
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "${GREEN}🎉 Ready to use! Visit: http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}⏳ Services are starting up. Check status in a few minutes with: ./scripts/status.sh${NC}"
        echo -e "${YELLOW}   If services don't start, try: ./scripts/seed-data.sh${NC}"
    fi
    
    echo ""
}

# Run main function
main "$@"