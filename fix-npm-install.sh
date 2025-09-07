#!/bin/bash

# Fix script for npm installation issues on macOS

echo "🔧 Fixing npm installation issues..."

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Remove existing node_modules and package-lock
echo "🗑️  Removing old dependencies..."
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --legacy-peer-deps

cd ..

echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 You can now run:"
echo "   ./start-macos.sh"
echo "   or"
echo "   ./start-simple.sh"