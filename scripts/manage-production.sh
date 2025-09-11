#!/bin/bash

# Trade AI Platform Production Management Script
# Utility script for managing the production deployment

set -e

PROJECT_DIR="/workspace/project/trade-ai-platform-v2"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Change to project directory
cd "$PROJECT_DIR"

show_help() {
    echo -e "${GREEN}Trade AI Platform Production Management${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start         Start all services"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  status        Show service status"
    echo "  logs          Show logs for all services"
    echo "  logs [service] Show logs for specific service"
    echo "  update        Update and rebuild services"
    echo "  backup        Create backup"
    echo "  restore       Restore from backup"
    echo "  health        Check service health"
    echo "  cleanup       Clean up old containers and images"
    echo "  ssl-renew     Renew SSL certificates"
    echo "  monitor       Show system monitoring info"
    echo ""
    echo "Services: mongodb, redis, backend, frontend, ai-services, monitoring, nginx"
}

start_services() {
    echo -e "${GREEN}Starting Trade AI Platform services...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    echo -e "${GREEN}Services started successfully!${NC}"
}

stop_services() {
    echo -e "${YELLOW}Stopping Trade AI Platform services...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}Services stopped successfully!${NC}"
}

restart_services() {
    echo -e "${YELLOW}Restarting Trade AI Platform services...${NC}"
    docker-compose -f "$COMPOSE_FILE" restart
    echo -e "${GREEN}Services restarted successfully!${NC}"
}

show_status() {
    echo -e "${BLUE}Trade AI Platform Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo -e "${BLUE}Container Health Status:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep trade-ai
}

show_logs() {
    if [ -z "$2" ]; then
        echo -e "${BLUE}Showing logs for all services (last 100 lines):${NC}"
        docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f
    else
        echo -e "${BLUE}Showing logs for $2:${NC}"
        docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f "$2"
    fi
}

update_services() {
    echo -e "${YELLOW}Updating Trade AI Platform...${NC}"
    
    # Pull latest code (if in git repo)
    if [ -d ".git" ]; then
        echo "Pulling latest code..."
        git pull
    fi
    
    # Rebuild and restart
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    echo -e "${GREEN}Update completed successfully!${NC}"
}

create_backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    BACKUP_DIR="backups"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    # MongoDB backup
    echo "Backing up MongoDB..."
    docker exec trade-ai-mongodb-prod mongodump --uri="mongodb://tradeai_admin:TradeAI_Mongo_2024_Secure_Password_!@#@localhost:27017/trade_ai_production?authSource=admin" --out="/backups/mongodb_$DATE"
    
    # Redis backup
    echo "Backing up Redis..."
    docker exec trade-ai-redis-prod redis-cli -a "TradeAI_Redis_2024_Secure_Password_!@#" --rdb "/backups/redis_$DATE.rdb"
    
    # Application data backup
    echo "Backing up application data..."
    tar -czf "$BACKUP_DIR/app_data_$DATE.tar.gz" backend/uploads logs
    
    echo -e "${GREEN}Backup completed: $DATE${NC}"
}

restore_backup() {
    echo -e "${RED}Restore functionality requires manual intervention.${NC}"
    echo "Available backups:"
    ls -la backups/
    echo ""
    echo "To restore:"
    echo "1. Stop services: $0 stop"
    echo "2. Restore MongoDB: docker exec -i trade-ai-mongodb-prod mongorestore --drop --uri='...' /backups/[backup_dir]"
    echo "3. Restore Redis: docker exec -i trade-ai-redis-prod redis-cli -a '...' --rdb /backups/[backup_file]"
    echo "4. Start services: $0 start"
}

check_health() {
    echo -e "${BLUE}Trade AI Platform Health Check:${NC}"
    echo ""
    
    # Check containers
    echo "Container Status:"
    services=("mongodb" "redis" "backend" "frontend" "ai-services" "monitoring" "nginx")
    for service in "${services[@]}"; do
        container_name="trade-ai-${service}-prod"
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")
            if [ "$health" = "healthy" ] || [ "$health" = "no-healthcheck" ]; then
                echo -e "  ✓ $service: ${GREEN}Running${NC}"
            else
                echo -e "  ✗ $service: ${RED}Unhealthy ($health)${NC}"
            fi
        else
            echo -e "  ✗ $service: ${RED}Not running${NC}"
        fi
    done
    
    echo ""
    echo "Endpoint Tests:"
    
    # Test endpoints
    if curl -k -s https://localhost/health.json > /dev/null 2>&1; then
        echo -e "  ✓ Frontend: ${GREEN}Responding${NC}"
    else
        echo -e "  ✗ Frontend: ${RED}Not responding${NC}"
    fi
    
    if curl -k -s https://localhost/api/health > /dev/null 2>&1; then
        echo -e "  ✓ Backend API: ${GREEN}Responding${NC}"
    else
        echo -e "  ✗ Backend API: ${RED}Not responding${NC}"
    fi
    
    if curl -k -s https://localhost/ai/health > /dev/null 2>&1; then
        echo -e "  ✓ AI Services: ${GREEN}Responding${NC}"
    else
        echo -e "  ✗ AI Services: ${RED}Not responding${NC}"
    fi
    
    if curl -k -s https://localhost/monitoring/health > /dev/null 2>&1; then
        echo -e "  ✓ Monitoring: ${GREEN}Responding${NC}"
    else
        echo -e "  ✗ Monitoring: ${RED}Not responding${NC}"
    fi
}

cleanup_system() {
    echo -e "${YELLOW}Cleaning up Docker system...${NC}"
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    read -p "Remove unused volumes? This may delete data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi
    
    # Remove unused networks
    docker network prune -f
    
    echo -e "${GREEN}Cleanup completed!${NC}"
}

renew_ssl() {
    echo -e "${YELLOW}Renewing SSL certificates...${NC}"
    
    # Run certbot renewal
    certbot renew --quiet
    
    # Copy renewed certificates
    cp /etc/letsencrypt/live/tradeai.gonxt.tech/fullchain.pem ssl/
    cp /etc/letsencrypt/live/tradeai.gonxt.tech/privkey.pem ssl/
    
    # Restart nginx
    docker-compose -f "$COMPOSE_FILE" restart nginx
    
    echo -e "${GREEN}SSL certificates renewed!${NC}"
}

show_monitoring() {
    echo -e "${BLUE}System Monitoring Information:${NC}"
    echo ""
    
    # System resources
    echo "System Resources:"
    echo "  CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "  Memory Usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "  Disk Usage: $(df / | awk 'NR==2 {print $5}')"
    echo ""
    
    # Docker stats
    echo "Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep trade-ai
    echo ""
    
    # Recent logs
    echo "Recent Error Logs:"
    find logs -name "*.log" -type f -exec grep -l "ERROR\|FATAL" {} \; 2>/dev/null | head -5 | while read file; do
        echo "  $file:"
        tail -3 "$file" | grep -E "ERROR|FATAL" | head -2 | sed 's/^/    /'
    done
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    update)
        update_services
        ;;
    backup)
        create_backup
        ;;
    restore)
        restore_backup
        ;;
    health)
        check_health
        ;;
    cleanup)
        cleanup_system
        ;;
    ssl-renew)
        renew_ssl
        ;;
    monitor)
        show_monitoring
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac