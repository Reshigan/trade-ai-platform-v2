#!/bin/bash

# Trade AI Platform - AWS Production Deployment Script
# This script deploys the complete multi-tenant Trade AI platform to AWS production environment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_DATE=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/var/log/trade-ai-deployment-${DEPLOYMENT_DATE}.log"

# Default values
ENVIRONMENT="production"
SKIP_BACKUP="false"
SKIP_TESTS="false"
FORCE_REBUILD="false"
DRY_RUN="false"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Help function
show_help() {
    cat << EOF
Trade AI Platform - AWS Production Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV     Target environment (default: production)
    -s, --skip-backup        Skip database backup before deployment
    -t, --skip-tests         Skip running tests before deployment
    -f, --force-rebuild      Force rebuild of all Docker images
    -d, --dry-run           Show what would be done without executing
    -h, --help              Show this help message

EXAMPLES:
    $0                      # Standard production deployment
    $0 --skip-backup        # Deploy without backup
    $0 --force-rebuild      # Force rebuild all images
    $0 --dry-run           # Preview deployment steps

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--skip-backup)
            SKIP_BACKUP="true"
            shift
            ;;
        -t|--skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        -f|--force-rebuild)
            FORCE_REBUILD="true"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Validation functions
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        warn "Running as root. Consider using a non-root user with sudo privileges."
    fi
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "git" "curl" "jq" "aws")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Required command '$cmd' is not installed"
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
    fi
    
    # Check AWS CLI configuration
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not configured properly"
    fi
    
    # Check disk space (minimum 10GB)
    local available_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 10485760 ]]; then
        error "Insufficient disk space. At least 10GB required."
    fi
    
    # Check memory (minimum 4GB)
    local available_memory=$(free -m | awk 'NR==2{print $7}')
    if [[ $available_memory -lt 4096 ]]; then
        warn "Low available memory. At least 4GB recommended."
    fi
    
    log "Prerequisites check completed successfully"
}

# Environment setup
setup_environment() {
    log "Setting up deployment environment..."
    
    cd "$PROJECT_ROOT"
    
    # Create necessary directories
    sudo mkdir -p /opt/trade-ai/{data,logs,backups,ssl}
    sudo mkdir -p /opt/trade-ai/data/{mongodb,mongodb-config,redis,ai-models,ai-data,monitoring}
    
    # Set proper permissions
    sudo chown -R $USER:$USER /opt/trade-ai
    chmod -R 755 /opt/trade-ai
    
    # Create log directory
    sudo mkdir -p /var/log/trade-ai
    sudo chown -R $USER:$USER /var/log/trade-ai
    
    # Load environment variables
    if [[ -f ".env.${ENVIRONMENT}" ]]; then
        set -a
        source ".env.${ENVIRONMENT}"
        set +a
        log "Loaded environment variables from .env.${ENVIRONMENT}"
    else
        error "Environment file .env.${ENVIRONMENT} not found"
    fi
    
    # Validate required environment variables
    local required_vars=("MONGO_USERNAME" "MONGO_PASSWORD" "JWT_SECRET" "REDIS_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    log "Environment setup completed"
}

# Backup existing data
backup_data() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        warn "Skipping backup as requested"
        return 0
    fi
    
    log "Creating backup of existing data..."
    
    local backup_dir="/opt/trade-ai/backups/pre-deployment-${DEPLOYMENT_DATE}"
    mkdir -p "$backup_dir"
    
    # Backup MongoDB if running
    if docker ps | grep -q "trade-ai-mongodb"; then
        log "Backing up MongoDB..."
        docker exec trade-ai-mongodb-aws-prod mongodump \
            --username="$MONGO_USERNAME" \
            --password="$MONGO_PASSWORD" \
            --authenticationDatabase=admin \
            --out="/backups/mongodb-${DEPLOYMENT_DATE}" || warn "MongoDB backup failed"
    fi
    
    # Backup Redis if running
    if docker ps | grep -q "trade-ai-redis"; then
        log "Backing up Redis..."
        docker exec trade-ai-redis-aws-prod redis-cli \
            --rdb "/backups/redis-${DEPLOYMENT_DATE}.rdb" || warn "Redis backup failed"
    fi
    
    # Backup application data
    if [[ -d "/opt/trade-ai/data" ]]; then
        log "Backing up application data..."
        tar -czf "$backup_dir/app-data-${DEPLOYMENT_DATE}.tar.gz" \
            -C /opt/trade-ai data/ || warn "Application data backup failed"
    fi
    
    # Upload backup to S3 if configured
    if [[ -n "${S3_BACKUP_BUCKET:-}" ]]; then
        log "Uploading backup to S3..."
        aws s3 sync "$backup_dir" "s3://${S3_BACKUP_BUCKET}/deployments/${DEPLOYMENT_DATE}/" \
            --delete || warn "S3 backup upload failed"
    fi
    
    log "Backup completed successfully"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        warn "Skipping tests as requested"
        return 0
    fi
    
    log "Running pre-deployment tests..."
    
    # Backend tests
    if [[ -f "backend/package.json" ]]; then
        log "Running backend tests..."
        cd backend
        npm test || error "Backend tests failed"
        cd ..
    fi
    
    # Frontend tests
    if [[ -f "frontend/package.json" ]]; then
        log "Running frontend tests..."
        cd frontend
        npm test -- --coverage --watchAll=false || error "Frontend tests failed"
        cd ..
    fi
    
    # Integration tests
    if [[ -f "tests/integration/package.json" ]]; then
        log "Running integration tests..."
        cd tests/integration
        npm test || error "Integration tests failed"
        cd ../..
    fi
    
    log "All tests passed successfully"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    local build_args=(
        "--build-arg" "BUILD_DATE=$(date -Iseconds)"
        "--build-arg" "VERSION=${VERSION:-2.0.0}"
        "--build-arg" "NODE_ENV=production"
    )
    
    if [[ "$FORCE_REBUILD" == "true" ]]; then
        build_args+=("--no-cache")
    fi
    
    # Build backend image
    log "Building backend image..."
    docker build "${build_args[@]}" \
        -f backend/Dockerfile.production \
        -t trade-ai-backend:${VERSION:-2.0.0} \
        -t trade-ai-backend:latest \
        backend/
    
    # Build frontend image
    log "Building frontend image..."
    docker build "${build_args[@]}" \
        --build-arg "REACT_APP_API_URL=${REACT_APP_API_URL}" \
        --build-arg "REACT_APP_SOCKET_URL=${REACT_APP_SOCKET_URL}" \
        --build-arg "REACT_APP_AI_API_URL=${REACT_APP_AI_API_URL}" \
        --build-arg "REACT_APP_MONITORING_URL=${REACT_APP_MONITORING_URL}" \
        -f frontend/Dockerfile.production \
        -t trade-ai-frontend:${VERSION:-2.0.0} \
        -t trade-ai-frontend:latest \
        frontend/
    
    # Build nginx image
    log "Building nginx image..."
    docker build "${build_args[@]}" \
        -f nginx/Dockerfile.production \
        -t trade-ai-nginx:${VERSION:-2.0.0} \
        -t trade-ai-nginx:latest \
        nginx/
    
    # Build AI services image
    if [[ -d "ai-services" ]]; then
        log "Building AI services image..."
        docker build "${build_args[@]}" \
            -f ai-services/Dockerfile.production \
            -t trade-ai-ai-services:${VERSION:-2.0.0} \
            -t trade-ai-ai-services:latest \
            ai-services/
    fi
    
    # Build monitoring image
    if [[ -d "monitoring" ]]; then
        log "Building monitoring image..."
        docker build "${build_args[@]}" \
            -f monitoring/Dockerfile.production \
            -t trade-ai-monitoring:${VERSION:-2.0.0} \
            -t trade-ai-monitoring:latest \
            monitoring/
    fi
    
    log "Docker images built successfully"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Stop existing services gracefully
    if docker-compose -f docker-compose.aws-production.yml ps | grep -q "Up"; then
        log "Stopping existing services..."
        docker-compose -f docker-compose.aws-production.yml down --timeout 30
    fi
    
    # Remove old containers and networks
    docker system prune -f
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.aws-production.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    local max_attempts=60
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        local healthy_services=0
        local total_services=0
        
        # Check each service health
        for service in mongodb redis backend frontend nginx; do
            total_services=$((total_services + 1))
            if docker-compose -f docker-compose.aws-production.yml ps "$service" | grep -q "healthy\|Up"; then
                healthy_services=$((healthy_services + 1))
            fi
        done
        
        if [[ $healthy_services -eq $total_services ]]; then
            log "All services are healthy"
            break
        fi
        
        attempt=$((attempt + 1))
        info "Waiting for services to be healthy... ($healthy_services/$total_services) - Attempt $attempt/$max_attempts"
        sleep 10
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "Services failed to become healthy within expected time"
    fi
    
    log "Services deployed successfully"
}

# Seed production data
seed_data() {
    log "Seeding production data..."
    
    # Wait for MongoDB to be ready
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if docker exec trade-ai-mongodb-aws-prod mongosh \
            --username="$MONGO_USERNAME" \
            --password="$MONGO_PASSWORD" \
            --authenticationDatabase=admin \
            --eval "db.adminCommand('ping')" &> /dev/null; then
            break
        fi
        
        attempt=$((attempt + 1))
        info "Waiting for MongoDB to be ready... Attempt $attempt/$max_attempts"
        sleep 5
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "MongoDB failed to become ready"
    fi
    
    # Run data seeding
    log "Running GONXT production data seeding..."
    docker exec trade-ai-backend-aws-prod node src/seeds/gonxt-production-seed.js || error "Data seeding failed"
    
    log "Production data seeded successfully"
}

# Post-deployment verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Check service endpoints
    local endpoints=(
        "http://localhost/health"
        "http://localhost/api/health"
        "http://localhost/monitoring/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        info "Checking endpoint: $endpoint"
        if curl -f -s "$endpoint" > /dev/null; then
            log "✓ $endpoint is responding"
        else
            error "✗ $endpoint is not responding"
        fi
    done
    
    # Check database connectivity
    info "Checking database connectivity..."
    if docker exec trade-ai-backend-aws-prod node -e "
        const mongoose = require('mongoose');
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => { console.log('Database connected'); process.exit(0); })
            .catch(err => { console.error('Database connection failed:', err); process.exit(1); });
    "; then
        log "✓ Database connectivity verified"
    else
        error "✗ Database connectivity failed"
    fi
    
    # Check Redis connectivity
    info "Checking Redis connectivity..."
    if docker exec trade-ai-redis-aws-prod redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
        log "✓ Redis connectivity verified"
    else
        error "✗ Redis connectivity failed"
    fi
    
    # Performance check
    info "Running performance check..."
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost/api/health)
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log "✓ API response time: ${response_time}s (Good)"
    else
        warn "⚠ API response time: ${response_time}s (Slow)"
    fi
    
    log "Deployment verification completed successfully"
}

# Cleanup function
cleanup() {
    log "Performing cleanup..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Clean up old log files (keep last 30 days)
    find /var/log/trade-ai -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Clean up old backups (keep last 7 days locally)
    find /opt/trade-ai/backups -name "*" -mtime +7 -delete 2>/dev/null || true
    
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Trade AI Platform AWS Production Deployment"
    log "Deployment ID: ${DEPLOYMENT_DATE}"
    log "Environment: ${ENVIRONMENT}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN MODE - No actual changes will be made"
        info "Would execute the following steps:"
        info "1. Check prerequisites"
        info "2. Setup environment"
        info "3. Backup existing data (skip: $SKIP_BACKUP)"
        info "4. Run tests (skip: $SKIP_TESTS)"
        info "5. Build Docker images (force rebuild: $FORCE_REBUILD)"
        info "6. Deploy services"
        info "7. Seed production data"
        info "8. Verify deployment"
        info "9. Cleanup"
        return 0
    fi
    
    # Execute deployment steps
    check_prerequisites
    setup_environment
    backup_data
    run_tests
    build_images
    deploy_services
    seed_data
    verify_deployment
    cleanup
    
    log "🎉 Trade AI Platform deployment completed successfully!"
    log "🌐 Application is available at: https://${DOMAIN_NAME:-tradeai.gonxt.tech}"
    log "📊 Monitoring dashboard: https://${DOMAIN_NAME:-tradeai.gonxt.tech}/monitoring"
    log "📋 Deployment log: $LOG_FILE"
    
    # Send notification (if configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Trade AI Platform deployed successfully to production\nDeployment ID: ${DEPLOYMENT_DATE}\nURL: https://${DOMAIN_NAME:-tradeai.gonxt.tech}\"}" \
            "$SLACK_WEBHOOK_URL" || warn "Failed to send Slack notification"
    fi
}

# Trap signals for cleanup
trap cleanup EXIT

# Run main function
main "$@"