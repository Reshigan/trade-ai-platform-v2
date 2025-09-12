#!/bin/bash

# Test React Build Script
# This script tests if the React build works and identifies issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "Testing React Build Process"

# Check if we're in the right directory
if [[ ! -f "frontend/package.json" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

cd frontend

# Check Node.js version
print_status "Node.js version: $(node --version)"
print_status "NPM version: $(npm --version)"

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    print_status "Installing dependencies..."
    npm install --legacy-peer-deps --force
else
    print_status "Dependencies already installed"
fi

# Check for common build issues
print_status "Checking for common build issues..."

# Check if all required components exist
MISSING_COMPONENTS=()

if [[ ! -f "src/components/Login.js" ]]; then
    MISSING_COMPONENTS+=("Login.js")
fi

if [[ ! -f "src/components/Dashboard.js" ]]; then
    MISSING_COMPONENTS+=("Dashboard.js")
fi

if [[ ! -f "src/components/Layout.js" ]]; then
    MISSING_COMPONENTS+=("Layout.js")
fi

if [[ ${#MISSING_COMPONENTS[@]} -gt 0 ]]; then
    print_error "Missing components: ${MISSING_COMPONENTS[*]}"
    exit 1
else
    print_success "All required components found"
fi

# Test the build
print_status "Testing React build..."

# Create a backup of build directory if it exists
if [[ -d "build" ]]; then
    print_status "Backing up existing build directory..."
    mv build build.backup.$(date +%s)
fi

# Try to build
if CI=false GENERATE_SOURCEMAP=false npm run build:react; then
    print_success "React build completed successfully!"
    
    # Check if build directory was created
    if [[ -d "build" ]]; then
        print_success "Build directory created"
        
        # Check if index.html exists
        if [[ -f "build/index.html" ]]; then
            print_success "index.html created"
            
            # Check if it contains React content
            if grep -q "react" build/index.html; then
                print_success "React content detected in build"
            else
                print_warning "No React content detected in build"
            fi
            
            # Check build size
            BUILD_SIZE=$(du -sh build | cut -f1)
            print_status "Build size: $BUILD_SIZE"
            
            # List build contents
            print_status "Build contents:"
            ls -la build/
            
        else
            print_error "index.html not found in build directory"
        fi
    else
        print_error "Build directory not created"
    fi
    
else
    print_error "React build failed!"
    print_status "Trying to identify the issue..."
    
    # Check for common dependency issues
    print_status "Checking for dependency conflicts..."
    npm ls --depth=0 2>&1 | grep -E "(UNMET|missing|invalid)" || print_status "No obvious dependency conflicts found"
    
    # Try building with more verbose output
    print_status "Attempting build with verbose output..."
    CI=false GENERATE_SOURCEMAP=false npm run build:react --verbose 2>&1 | tail -50
fi

cd ..

print_status "React build test completed"