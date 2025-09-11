#!/bin/bash

# Trade AI Platform - AWS Quick Deploy Script
# One-command deployment for AWS production environment

set -e

# Configuration
DOMAIN="tradeai.gonxt.tech"
SERVER_IP="13.247.139.75"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                 Trade AI Platform                            ║
║              AWS Production Quick Deploy                     ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo "Domain: $DOMAIN"
echo "Server IP: $SERVER_IP"
echo "Environment: AWS Production"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   echo "Run with: sudo $0"
   exit 1
fi

# Prompt for required information
echo -e "${YELLOW}Please provide the following information:${NC}"
echo ""

read -p "OpenAI API Key: " OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}OpenAI API Key is required${NC}"
    exit 1
fi

read -p "Email for SSL certificates (default: admin@gonxt.tech): " SSL_EMAIL
SSL_EMAIL=${SSL_EMAIL:-admin@gonxt.tech}

echo ""
echo -e "${YELLOW}Configuration Summary:${NC}"
echo "Domain: $DOMAIN"
echo "Server IP: $SERVER_IP"
echo "SSL Email: $SSL_EMAIL"
echo "OpenAI API Key: [HIDDEN]"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Update environment file with provided values
echo -e "${YELLOW}Updating environment configuration...${NC}"
sed -i "s/AI_MODEL_API_KEY=your_openai_api_key_here/AI_MODEL_API_KEY=$OPENAI_API_KEY/" .env.production
sed -i "s/SSL_EMAIL=admin@gonxt.tech/SSL_EMAIL=$SSL_EMAIL/" .env.production

# Run main deployment script
echo -e "${GREEN}Starting deployment...${NC}"
./deploy-production.sh

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT COMPLETE!                     ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo "Your Trade AI Platform is now running at:"
echo "🌐 https://$DOMAIN"
echo ""
echo "Management commands:"
echo "📊 Check status: ./scripts/manage-production.sh status"
echo "📋 View logs: ./scripts/manage-production.sh logs"
echo "🔍 Health check: ./scripts/manage-production.sh health"
echo "💾 Create backup: ./scripts/manage-production.sh backup"
echo ""
echo "Important: Make sure your DNS records point $DOMAIN to $SERVER_IP"
echo ""
echo -e "${GREEN}Happy trading! 🚀${NC}"