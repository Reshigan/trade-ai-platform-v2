#!/bin/bash

# Trade AI macOS Deployment Script
# This script sets up and runs the Trade AI system on macOS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ASCII Art Banner
echo "
╔════════════════════════════════════════╗
║        Trade AI Deployment Tool        ║
║           macOS Edition                ║
╚════════════════════════════════════════╝
"

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only"
    exit 1
fi

# Check for required tools
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js first:"
    echo "brew install node"
    exit 1
else
    NODE_VERSION=$(node -v)
    print_status "Node.js $NODE_VERSION found"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
else
    NPM_VERSION=$(npm -v)
    print_status "npm $NPM_VERSION found"
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Main menu
echo ""
echo "Select deployment option:"
echo "1) Quick Start (Development Mode)"
echo "2) Production Build"
echo "3) Install Dependencies Only"
echo "4) Stop All Services"
echo "5) View Logs"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        print_status "Starting Quick Development Setup..."
        
        # Check if ports are available
        if check_port 5000; then
            print_warning "Port 5000 is already in use"
            read -p "Kill the process using port 5000? (y/n): " kill_backend
            if [[ $kill_backend == "y" ]]; then
                lsof -ti:5000 | xargs kill -9
                print_status "Port 5000 cleared"
            else
                print_error "Cannot continue with port 5000 in use"
                exit 1
            fi
        fi
        
        if check_port 3000; then
            print_warning "Port 3000 is already in use"
            read -p "Kill the process using port 3000? (y/n): " kill_frontend
            if [[ $kill_frontend == "y" ]]; then
                lsof -ti:3000 | xargs kill -9
                print_status "Port 3000 cleared"
            else
                print_error "Cannot continue with port 3000 in use"
                exit 1
            fi
        fi
        
        # Backend setup
        print_status "Setting up backend..."
        cd backend
        
        # Check if node_modules exists
        if [ ! -d "node_modules" ]; then
            print_status "Installing backend dependencies..."
            npm install
        else
            print_status "Backend dependencies already installed"
        fi
        
        # Create .env if it doesn't exist
        if [ ! -f ".env" ]; then
            print_status "Creating backend .env file..."
            cat > .env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
MOCK_MODE=true
EOF
        fi
        
        # Start backend in background
        print_status "Starting backend server..."
        npm start &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        
        # Wait for backend to start
        sleep 5
        
        # Frontend setup
        print_status "Setting up frontend..."
        cd ../frontend
        
        # Check if node_modules exists
        if [ ! -d "node_modules" ]; then
            print_status "Installing frontend dependencies..."
            npm install
        else
            print_status "Frontend dependencies already installed"
        fi
        
        # Create .env if it doesn't exist
        if [ ! -f ".env" ]; then
            print_status "Creating frontend .env file..."
            cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
EOF
        fi
        
        # Start frontend
        print_status "Starting frontend server..."
        npm start &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../frontend.pid
        
        print_status "Trade AI is starting up..."
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Backend:  http://localhost:5000"
        echo "Frontend: http://localhost:3000"
        echo "API Docs: http://localhost:5000/api/docs"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Quick Login Credentials:"
        echo "Admin: admin@tradeai.com / password123"
        echo "Manager: manager@tradeai.com / password123"
        echo "KAM: kam@tradeai.com / password123"
        echo ""
        echo "Press Ctrl+C to stop all services"
        
        # Wait for user to stop
        wait
        ;;
        
    2)
        print_status "Building for production..."
        
        # Backend build
        cd backend
        print_status "Building backend..."
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        
        # Frontend build
        cd ../frontend
        print_status "Building frontend..."
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        npm run build
        
        print_status "Production build complete!"
        echo "Frontend build available in: frontend/build/"
        
        # Ask if user wants to serve
        read -p "Start production servers? (y/n): " start_prod
        if [[ $start_prod == "y" ]]; then
            # Install serve if not available
            if ! command -v serve &> /dev/null; then
                print_status "Installing serve..."
                npm install -g serve
            fi
            
            # Start backend
            cd ../backend
            NODE_ENV=production npm start &
            echo $! > ../backend.pid
            
            # Start frontend
            cd ../frontend
            serve -s build -l 3000 &
            echo $! > ../frontend.pid
            
            print_status "Production servers started!"
        fi
        ;;
        
    3)
        print_status "Installing dependencies..."
        
        # Backend
        cd backend
        print_status "Installing backend dependencies..."
        npm install
        
        # Frontend
        cd ../frontend
        print_status "Installing frontend dependencies..."
        npm install
        
        print_status "All dependencies installed!"
        ;;
        
    4)
        print_status "Stopping all services..."
        
        # Stop backend
        if [ -f "backend.pid" ]; then
            kill $(cat backend.pid) 2>/dev/null || true
            rm backend.pid
            print_status "Backend stopped"
        fi
        
        # Stop frontend
        if [ -f "frontend.pid" ]; then
            kill $(cat frontend.pid) 2>/dev/null || true
            rm frontend.pid
            print_status "Frontend stopped"
        fi
        
        # Kill any remaining processes on ports
        lsof -ti:5000 | xargs kill -9 2>/dev/null || true
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        
        print_status "All services stopped"
        ;;
        
    5)
        print_status "Viewing logs..."
        echo "Select log to view:"
        echo "1) Backend logs"
        echo "2) Frontend logs"
        echo "3) Both (split screen)"
        read -p "Enter choice (1-3): " log_choice
        
        case $log_choice in
            1)
                cd backend
                npm run dev
                ;;
            2)
                cd frontend
                npm start
                ;;
            3)
                # Use tmux if available
                if command -v tmux &> /dev/null; then
                    tmux new-session -d -s tradeai
                    tmux split-window -h
                    tmux send-keys -t 0 'cd backend && npm start' C-m
                    tmux send-keys -t 1 'cd frontend && npm start' C-m
                    tmux attach-session -t tradeai
                else
                    print_warning "tmux not installed. Install with: brew install tmux"
                    echo "Starting in sequential mode..."
                    cd backend && npm start &
                    cd ../frontend && npm start
                fi
                ;;
        esac
        ;;
        
    6)
        print_status "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Cleanup function
cleanup() {
    echo ""
    print_warning "Shutting down..."
    
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null || true
        rm backend.pid
    fi
    
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm frontend.pid
    fi
    
    print_status "Cleanup complete"
}

# Set trap for cleanup
trap cleanup EXIT INT TERM