#!/bin/bash

# Trade AI Platform v2 - Quick AWS Deployment
# One-command deployment for AWS EC2 instances

set -e

echo "🚀 Trade AI Platform v2 - Quick AWS Deployment"
echo "=============================================="
echo "This script will deploy the complete Trade AI Platform with GONXT demo data"
echo

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running on AWS
if curl -s --max-time 3 http://169.254.169.254/latest/meta-data/instance-id &>/dev/null; then
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    print_success "Detected AWS EC2 Instance: $INSTANCE_ID"
    print_success "Public IP: $PUBLIC_IP"
else
    print_warning "Not running on AWS EC2, proceeding with local deployment"
    PUBLIC_IP="localhost"
fi

# Update system
print_status "Updating system packages..."
sudo apt update -y

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo apt install git -y
fi

# Clone repository if not present
if [[ ! -d "trade-ai-platform-v2" ]]; then
    print_status "Cloning Trade AI Platform repository..."
    git clone https://github.com/Reshigan/trade-ai-platform-v2.git
fi

# Change to project directory
cd trade-ai-platform-v2

# Make deployment script executable
chmod +x aws-production-deploy.sh

# Run full deployment
print_status "Starting complete AWS production deployment..."
print_warning "This will take 10-15 minutes. Please wait..."
echo

./aws-production-deploy.sh

echo
echo "================================================================"
echo "🎉 Quick AWS Deployment Complete!"
echo "================================================================"
echo
echo "🌐 Access your Trade AI Platform:"
echo "  Frontend:    http://$PUBLIC_IP:3001"
echo "  Backend API: http://$PUBLIC_IP:5001/api"
echo
echo "🔐 Demo Credentials:"
echo "  GONXT:  admin@gonxt.tech / GonxtAdmin2024!"
echo "  Test:   admin@test.demo / TestAdmin2024!"
echo
echo "📊 Features Ready:"
echo "  ✅ Complete FMCG trade spend management"
echo "  ✅ Advanced analytics with ML predictions"
echo "  ✅ 2+ years of GONXT demo data"
echo "  ✅ Multi-tenant architecture"
echo "  ✅ AI chat assistant"
echo "  ✅ Comprehensive reporting"
echo
echo "🚀 Ready for customer demonstrations!"
echo "================================================================"