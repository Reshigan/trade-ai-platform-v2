#!/bin/bash

# Health Check Script for Production Services
set -e

SERVICES=("mongodb:27017" "redis:6379" "backend:5000" "frontend:3000" "ai-services:8000" "monitoring:8080")
FAILED_SERVICES=()

echo "[$(date)] Starting health check..."

for service in "${SERVICES[@]}"; do
    IFS=':' read -r host port <<< "$service"
    
    if curl -f --connect-timeout 5 --max-time 10 "http://$host:$port/health" &>/dev/null || \
       nc -z "$host" "$port" &>/dev/null; then
        echo "[$(date)] ✅ $service is healthy"
    else
        echo "[$(date)] ❌ $service is unhealthy"
        FAILED_SERVICES+=("$service")
    fi
done

# Send alerts if services are down
if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    ALERT_MESSAGE="ALERT: The following services are down: ${FAILED_SERVICES[*]}"
    echo "[$(date)] $ALERT_MESSAGE"
    
    # Send email alert if configured
    if [ ! -z "$ALERT_EMAIL" ]; then
        echo "$ALERT_MESSAGE" | mail -s "Trade AI Platform Health Alert" "$ALERT_EMAIL"
    fi
    
    # Send Slack alert if configured
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$ALERT_MESSAGE\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    exit 1
else
    echo "[$(date)] All services are healthy"
fi