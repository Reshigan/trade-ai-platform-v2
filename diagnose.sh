#!/bin/bash

echo "🔍 Trade AI Diagnostic Script"
echo "============================"
echo ""

# Check Node version
echo "📌 Node.js version: $(node -v)"
echo "📌 npm version: $(npm -v)"
echo ""

# Check if backend dependencies are installed
echo "🔍 Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "✅ backend/node_modules exists"
    
    # Check for specific missing module
    if [ -d "backend/node_modules/swagger-jsdoc" ]; then
        echo "✅ swagger-jsdoc is installed"
    else
        echo "❌ swagger-jsdoc is NOT installed"
    fi
    
    if [ -d "backend/node_modules/express-mongo-sanitize" ]; then
        echo "✅ express-mongo-sanitize is installed"
    else
        echo "❌ express-mongo-sanitize is NOT installed"
    fi
    
    # Count total packages
    BACKEND_COUNT=$(ls backend/node_modules | wc -l)
    echo "📦 Total backend packages: $BACKEND_COUNT"
else
    echo "❌ backend/node_modules does NOT exist - dependencies not installed!"
fi

echo ""

# Check if frontend dependencies are installed
echo "🔍 Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ frontend/node_modules exists"
    FRONTEND_COUNT=$(ls frontend/node_modules | wc -l)
    echo "📦 Total frontend packages: $FRONTEND_COUNT"
else
    echo "❌ frontend/node_modules does NOT exist - dependencies not installed!"
fi

echo ""

# Check MongoDB
echo "🔍 Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB is not running"
fi

echo ""
echo "📋 Diagnosis Summary:"
echo "===================="

if [ ! -d "backend/node_modules" ]; then
    echo "❌ Backend dependencies are NOT installed"
    echo "   Run: cd backend && npm install"
elif [ ! -d "backend/node_modules/swagger-jsdoc" ]; then
    echo "❌ Some backend dependencies are missing"
    echo "   Run: cd backend && npm install"
else
    echo "✅ Backend dependencies appear to be installed"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies are NOT installed"
    echo "   Run: cd frontend && npm install --legacy-peer-deps"
else
    echo "✅ Frontend dependencies appear to be installed"
fi

echo ""
echo "🔧 Recommended action:"
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "   Run: ./install-now.sh"
else
    echo "   Try: ./start-minimal.sh"
fi