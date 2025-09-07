#!/bin/bash

# Clean Docker build script for Trade AI
# This script ensures a completely clean build without any cache

echo "🧹 Cleaning Docker build cache..."

# Stop all containers
echo "Stopping containers..."
docker-compose down

# Remove all build cache
echo "Removing Docker build cache..."
docker builder prune -af

# Remove any dangling images
echo "Removing dangling images..."
docker image prune -f

# Build with cache busting
echo "🔨 Building frontend with cache invalidation..."
export CACHEBUST=$(date +%s)
docker-compose build --no-cache frontend

echo "🔨 Building backend..."
docker-compose build backend

echo "✅ Build complete!"
echo ""
echo "To start the services, run:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"