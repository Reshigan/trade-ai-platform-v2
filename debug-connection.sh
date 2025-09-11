#!/bin/bash

# Debug Frontend-Backend Connection Script
# This script helps diagnose connection issues between frontend and backend

echo "=== Trade AI Platform Connection Debug ==="
echo "Date: $(date)"
echo ""

# Check if containers are running
echo "1. Container Status:"
echo "==================="
docker-compose -f docker-compose.production.yml ps
echo ""

# Check container logs
echo "2. Recent Container Logs:"
echo "========================="
echo "--- Frontend Logs ---"
docker-compose -f docker-compose.production.yml logs --tail=10 frontend
echo ""

echo "--- Backend Logs ---"
docker-compose -f docker-compose.production.yml logs --tail=10 backend
echo ""

echo "--- Nginx Logs ---"
docker-compose -f docker-compose.production.yml logs --tail=10 nginx
echo ""

# Test internal container connectivity
echo "3. Internal Container Connectivity:"
echo "==================================="
echo "Testing frontend container health:"
docker-compose -f docker-compose.production.yml exec frontend wget -q --spider http://localhost:80/health.json && echo "✅ Frontend health check: OK" || echo "❌ Frontend health check: FAILED"

echo "Testing backend container health:"
docker-compose -f docker-compose.production.yml exec backend curl -f http://localhost:5000/health 2>/dev/null && echo "✅ Backend health check: OK" || echo "❌ Backend health check: FAILED"

echo "Testing backend API health:"
docker-compose -f docker-compose.production.yml exec backend curl -f http://localhost:5000/api/health 2>/dev/null && echo "✅ Backend API health check: OK" || echo "❌ Backend API health check: FAILED"

echo ""

# Test external connectivity
echo "4. External Connectivity:"
echo "========================="
echo "Testing HTTP access:"
curl -I http://localhost 2>/dev/null | head -1 && echo "✅ HTTP access: OK" || echo "❌ HTTP access: FAILED"

echo "Testing HTTPS access (ignoring SSL):"
curl -k -I https://localhost 2>/dev/null | head -1 && echo "✅ HTTPS access: OK" || echo "❌ HTTPS access: FAILED"

echo "Testing API endpoint:"
curl -k -I https://localhost/api/health 2>/dev/null | head -1 && echo "✅ API endpoint: OK" || echo "❌ API endpoint: FAILED"

echo ""

# Check network configuration
echo "5. Network Configuration:"
echo "========================="
echo "Docker networks:"
docker network ls | grep trade-ai

echo ""
echo "Container network details:"
docker-compose -f docker-compose.production.yml exec nginx ip addr show eth0 2>/dev/null | grep inet || echo "Could not get nginx IP"
docker-compose -f docker-compose.production.yml exec frontend ip addr show eth0 2>/dev/null | grep inet || echo "Could not get frontend IP"
docker-compose -f docker-compose.production.yml exec backend ip addr show eth0 2>/dev/null | grep inet || echo "Could not get backend IP"

echo ""

# Check environment variables
echo "6. Environment Variables:"
echo "========================="
echo "Frontend environment:"
docker-compose -f docker-compose.production.yml exec frontend env | grep REACT_APP || echo "No REACT_APP variables found"

echo ""
echo "Backend environment:"
docker-compose -f docker-compose.production.yml exec backend env | grep -E "(NODE_ENV|PORT|MONGODB_URI|REDIS_URL)" || echo "No backend environment variables found"

echo ""

# Check file permissions and content
echo "7. File System Check:"
echo "===================="
echo "Frontend build files:"
docker-compose -f docker-compose.production.yml exec frontend ls -la /usr/share/nginx/html/ | head -10

echo ""
echo "Frontend nginx config:"
docker-compose -f docker-compose.production.yml exec frontend cat /etc/nginx/conf.d/default.conf | head -20

echo ""

echo "=== Debug Complete ==="
echo "If you see any ❌ FAILED items above, those need to be fixed."
echo "Check the container logs for more detailed error messages."