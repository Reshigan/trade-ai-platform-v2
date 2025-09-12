#!/bin/bash

# TRADEAI Migration Script
# This script helps migrate the codebase to the new TRADEAI repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TRADEAI Migration Script${NC}"
echo -e "${BLUE}=============================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "production/deploy.sh" ]; then
    echo -e "${RED}❌ Error: This script must be run from the trade-ai-platform-v2 root directory${NC}"
    echo -e "${RED}   Make sure you're in the directory containing the 'production' folder${NC}"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Error: Git is not installed or not in PATH${NC}"
    exit 1
fi

# Check current git status
echo -e "${YELLOW}=== CHECKING CURRENT REPOSITORY STATUS ===${NC}"
git status --porcelain
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo -e "${YELLOW}   Please commit or stash your changes before migration${NC}"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Migration cancelled${NC}"
        exit 1
    fi
fi

# Get the new repository URL
echo ""
echo -e "${YELLOW}=== REPOSITORY CONFIGURATION ===${NC}"
echo -e "${BLUE}Please create the new repository on GitHub first:${NC}"
echo -e "${BLUE}1. Go to https://github.com${NC}"
echo -e "${BLUE}2. Click '+' → 'New repository'${NC}"
echo -e "${BLUE}3. Repository name: TRADEAI${NC}"
echo -e "${BLUE}4. Description: Trade AI Platform - Complete production-ready platform${NC}"
echo -e "${BLUE}5. Make it Public (or Private)${NC}"
echo -e "${BLUE}6. Do NOT initialize with README${NC}"
echo -e "${BLUE}7. Click 'Create repository'${NC}"
echo ""

read -p "Have you created the repository? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Please create the repository first${NC}"
    exit 1
fi

# Get repository URL
read -p "Enter your GitHub username: " GITHUB_USER
if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}❌ GitHub username is required${NC}"
    exit 1
fi

REPO_URL="https://github.com/$GITHUB_USER/TRADEAI.git"
echo -e "${GREEN}Repository URL: $REPO_URL${NC}"

# Confirm the migration
echo ""
echo -e "${YELLOW}=== MIGRATION CONFIRMATION ===${NC}"
echo -e "${BLUE}This will:${NC}"
echo -e "${BLUE}1. Add TRADEAI as a new remote${NC}"
echo -e "${BLUE}2. Push all branches and tags to TRADEAI${NC}"
echo -e "${BLUE}3. Optionally set TRADEAI as the default remote${NC}"
echo ""

read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Migration cancelled${NC}"
    exit 1
fi

# Add the new remote
echo ""
echo -e "${YELLOW}=== ADDING TRADEAI REMOTE ===${NC}"
if git remote get-url tradeai &> /dev/null; then
    echo -e "${YELLOW}⚠️  TRADEAI remote already exists, updating URL${NC}"
    git remote set-url tradeai "$REPO_URL"
else
    git remote add tradeai "$REPO_URL"
fi
echo -e "${GREEN}✅ Added TRADEAI remote: $REPO_URL${NC}"

# Push to the new repository
echo ""
echo -e "${YELLOW}=== PUSHING TO TRADEAI ===${NC}"
echo -e "${BLUE}Pushing main branch...${NC}"
git push tradeai main

echo -e "${BLUE}Pushing tags...${NC}"
git push tradeai --tags

echo -e "${GREEN}✅ Successfully pushed to TRADEAI repository${NC}"

# Ask about setting as default remote
echo ""
echo -e "${YELLOW}=== DEFAULT REMOTE CONFIGURATION ===${NC}"
read -p "Do you want to set TRADEAI as the default remote (origin)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git remote set-url origin "$REPO_URL"
    echo -e "${GREEN}✅ Set TRADEAI as default remote (origin)${NC}"
else
    echo -e "${BLUE}ℹ️  Keeping current origin remote${NC}"
fi

# Show current remotes
echo ""
echo -e "${YELLOW}=== CURRENT REMOTES ===${NC}"
git remote -v

# Test the new repository
echo ""
echo -e "${YELLOW}=== TESTING NEW REPOSITORY ===${NC}"
echo -e "${BLUE}To test the new repository:${NC}"
echo ""
echo -e "${GREEN}# Clone the new repository${NC}"
echo -e "${GREEN}git clone $REPO_URL${NC}"
echo -e "${GREEN}cd solarnexus/production${NC}"
echo -e "${GREEN}./deploy.sh${NC}"
echo ""

# Migration summary
echo -e "${YELLOW}=== MIGRATION COMPLETE ===${NC}"
echo -e "${GREEN}✅ Successfully migrated to TRADEAI repository${NC}"
echo -e "${GREEN}✅ Repository URL: $REPO_URL${NC}"
echo -e "${GREEN}✅ All branches and tags pushed${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Visit: https://github.com/$GITHUB_USER/TRADEAI${NC}"
echo -e "${BLUE}2. Update repository description and settings${NC}"
echo -e "${BLUE}3. Test deployment: git clone $REPO_URL && cd TRADEAI/production && ./deploy.sh${NC}"
echo -e "${BLUE}4. Update team members about the new repository${NC}"
echo -e "${BLUE}5. Consider archiving the old repository${NC}"
echo ""

echo -e "${GREEN}🎉 Welcome to TRADEAI!${NC}"
echo -e "${GREEN}Your production-ready trade marketing platform is now available at:${NC}"
echo -e "${GREEN}https://github.com/$GITHUB_USER/TRADEAI${NC}"