#!/bin/bash

# Trade AI Platform - Production Cleanup Script
# This script removes all development/test data and prepares the codebase for production

set -e

echo "=== TRADE AI PLATFORM - PRODUCTION CLEANUP ==="
echo "Removing development and test data..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"

# 1. Remove test data directories
echo "Removing test data directories..."
if [ -d "test_data" ]; then
    echo "  - Removing test_data directory"
    rm -rf test_data
fi

if [ -d "demo_data" ]; then
    echo "  - Removing demo_data directory"
    rm -rf demo_data
fi

if [ -d "mock_data" ]; then
    echo "  - Removing mock_data directory"
    rm -rf mock_data
fi

# 2. Remove development scripts
echo "Removing development scripts..."
DEV_SCRIPTS=(
    "remove-all-demo-data.py"
    "check-test-users.js"
    "integration-test/full_system_test.py"
    "fix-frontend.sh"
    "test-auth.sh"
    "setup-dev.sh"
)

for script in "${DEV_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "  - Removing $script"
        rm -f "$script"
    fi
done

# 3. Remove development Docker files
echo "Removing development Docker files..."
if [ -f "docker-compose.yml" ]; then
    echo "  - Backing up docker-compose.yml to docker-compose.dev.yml"
    mv docker-compose.yml docker-compose.dev.yml
fi

if [ -f "docker-compose.override.yml" ]; then
    echo "  - Removing docker-compose.override.yml"
    rm -f docker-compose.override.yml
fi

# 4. Clean up development environment files
echo "Cleaning up development environment files..."
if [ -f "backend/.env.development" ]; then
    echo "  - Removing backend/.env.development"
    rm -f backend/.env.development
fi

if [ -f "frontend/.env.development" ]; then
    echo "  - Removing frontend/.env.development"
    rm -f frontend/.env.development
fi

# 5. Remove development seed data
echo "Removing development seed data..."
if [ -f "mongodb/seed/seed-gonxt-data.js" ]; then
    echo "  - Backing up development seed to mongodb/seed/seed-gonxt-data.dev.js"
    mv mongodb/seed/seed-gonxt-data.js mongodb/seed/seed-gonxt-data.dev.js
fi

# 6. Clean up node_modules and build artifacts
echo "Cleaning up build artifacts..."
if [ -d "frontend/node_modules" ]; then
    echo "  - Removing frontend/node_modules"
    rm -rf frontend/node_modules
fi

if [ -d "backend/node_modules" ]; then
    echo "  - Removing backend/node_modules"
    rm -rf backend/node_modules
fi

if [ -d "frontend/build" ]; then
    echo "  - Removing frontend/build"
    rm -rf frontend/build
fi

# 7. Remove log files
echo "Cleaning up log files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true

# 8. Remove temporary files
echo "Cleaning up temporary files..."
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

# 9. Clean up package files
echo "Cleaning up package files..."
if [ -f "backend/package-simple.json" ]; then
    echo "  - Removing backend/package-simple.json"
    rm -f backend/package-simple.json
fi

# 10. Remove IDE and editor files
echo "Cleaning up IDE files..."
rm -rf .vscode 2>/dev/null || true
rm -rf .idea 2>/dev/null || true
rm -f *.swp *.swo 2>/dev/null || true

# 11. Create production directory structure
echo "Creating production directory structure..."
mkdir -p production/ssl
mkdir -p production/logs/mongodb
mkdir -p production/logs/redis
mkdir -p production/logs/backend
mkdir -p production/logs/frontend
mkdir -p production/logs/nginx
mkdir -p production/logs/ai-services
mkdir -p production/logs/monitoring
mkdir -p production/backups

# 12. Copy production files to root if needed
echo "Setting up production configuration..."
if [ -f "production/.env.production" ]; then
    echo "  - Production environment files are ready in production/ directory"
fi

# 13. Create production README
cat > production/README.md << 'EOF'
# Trade AI Platform - Production Deployment

This directory contains all production-ready configuration files and scripts.

## Files:
- `.env.production` - Backend production environment variables
- `.env.frontend.production` - Frontend production environment variables
- `docker-compose.production.yml` - Production Docker Compose configuration
- `seed-production-data.js` - Production database seed script
- `clean-for-production.sh` - Cleanup script (already run)
- `deploy.sh` - Production deployment script

## Quick Start:
1. Update all passwords and secrets in .env files
2. Configure SSL certificates in ssl/ directory
3. Run: `./deploy.sh`

## Test Accounts:
- Super Admin: superadmin@gonxt.tech / password123
- Admin: admin@gonxt.tech / password123
- Manager: manager@gonxt.tech / password123
- KAM: kam@gonxt.tech / password123
- Analyst: analyst@gonxt.tech / password123
- Finance: finance@gonxt.tech / password123
- Sales Rep: sales@gonxt.tech / password123
- Viewer: viewer@gonxt.tech / password123

**IMPORTANT: Change all default passwords immediately after deployment!**
EOF

echo ""
echo "=== CLEANUP COMPLETE ==="
echo ""
echo "✅ Development and test data removed"
echo "✅ Production directory structure created"
echo "✅ Configuration files prepared"
echo ""
echo "NEXT STEPS:"
echo "1. Review and update production/.env.production"
echo "2. Review and update production/.env.frontend.production"
echo "3. Configure SSL certificates in production/ssl/"
echo "4. Run production deployment: cd production && ./deploy.sh"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - Change all default passwords in .env files"
echo "   - Update JWT secrets with secure random strings"
echo "   - Configure proper SMTP settings"
echo "   - Set up SSL certificates"
echo ""
echo "Production cleanup completed successfully!"