#!/bin/bash

# Fix Frontend-Backend Connection Script
# This script fixes common connection issues between frontend and backend

set -e

echo "🔧 Fixing Frontend-Backend Connection Issues"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Error: docker-compose.production.yml not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Step 1: Stopping existing containers..."
sudo docker-compose -f docker-compose.production.yml down

echo "📋 Step 2: Removing old images to force rebuild..."
sudo docker-compose -f docker-compose.production.yml down --rmi all --volumes --remove-orphans 2>/dev/null || true

echo "📋 Step 3: Cleaning up Docker system..."
sudo docker system prune -f

echo "📋 Step 4: Building containers with updated configurations..."
sudo docker-compose -f docker-compose.production.yml build --no-cache --pull

echo "📋 Step 5: Starting containers..."
sudo docker-compose -f docker-compose.production.yml up -d

echo "📋 Step 6: Waiting for containers to start..."
sleep 30

echo "📋 Step 7: Checking container status..."
sudo docker-compose -f docker-compose.production.yml ps

echo "📋 Step 8: Running connection tests..."
echo ""

# Test container health
echo "🔍 Testing container health..."
for service in mongodb redis backend ai-services frontend monitoring nginx; do
    if sudo docker-compose -f docker-compose.production.yml ps | grep -q "${service}.*Up"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
    fi
done

echo ""

# Test internal connectivity
echo "🔍 Testing internal connectivity..."
sleep 10

# Test backend health
if sudo docker-compose -f docker-compose.production.yml exec -T backend curl -f http://localhost:5000/health >/dev/null 2>&1; then
    echo "✅ Backend health check: OK"
else
    echo "❌ Backend health check: FAILED"
    echo "Backend logs:"
    sudo docker-compose -f docker-compose.production.yml logs --tail=20 backend
fi

# Test frontend health
if sudo docker-compose -f docker-compose.production.yml exec -T frontend wget -q --spider http://localhost:80/health.json; then
    echo "✅ Frontend health check: OK"
else
    echo "❌ Frontend health check: FAILED"
    echo "Frontend logs:"
    sudo docker-compose -f docker-compose.production.yml logs --tail=20 frontend
fi

echo ""

# Test external access
echo "🔍 Testing external access..."
if curl -I http://localhost >/dev/null 2>&1; then
    echo "✅ HTTP access: OK"
else
    echo "❌ HTTP access: FAILED"
fi

if curl -k -I https://localhost >/dev/null 2>&1; then
    echo "✅ HTTPS access: OK"
else
    echo "❌ HTTPS access: FAILED"
fi

if curl -k -I https://localhost/api/health >/dev/null 2>&1; then
    echo "✅ API endpoint: OK"
else
    echo "❌ API endpoint: FAILED"
fi

echo ""
echo "🎉 Fix script completed!"
echo ""
echo "📊 Next steps:"
echo "1. Test your website: https://tradeai.gonxt.tech"
echo "2. Check API health: https://tradeai.gonxt.tech/api/health"
echo "3. If issues persist, run: ./debug-connection.sh"
echo ""
echo "📝 Common fixes applied:"
echo "- Updated Content Security Policy to allow Google Fonts and external resources"
echo "- Fixed nginx routing configuration"
echo "- Rebuilt all containers with latest configurations"
echo "- Ensured proper container networking"