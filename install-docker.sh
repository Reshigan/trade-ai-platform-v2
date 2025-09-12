#!/bin/bash

# Docker Installation Script for Ubuntu/Debian
# This script installs Docker Engine and Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    print_error "This script requires sudo privileges. Please ensure your user can run sudo commands."
    exit 1
fi

print_status "Starting Docker installation..."

# Update package index
print_status "Updating package index..."
sudo apt-get update

# Install prerequisites
print_status "Installing prerequisites..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Remove old Docker versions if they exist
print_status "Removing old Docker versions (if any)..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
print_status "Adding Docker's official GPG key..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
print_status "Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
print_status "Updating package index with Docker repository..."
sudo apt-get update

# Install Docker Engine
print_status "Installing Docker Engine..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
print_status "Starting and enabling Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
print_status "Adding current user to docker group..."
sudo usermod -aG docker $USER

# Install Docker Compose (standalone version as backup)
print_status "Installing Docker Compose standalone..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create symbolic link for docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Test Docker installation
print_status "Testing Docker installation..."
if sudo docker run --rm hello-world > /dev/null 2>&1; then
    print_success "Docker is working correctly!"
else
    print_error "Docker test failed. Please check the installation."
    exit 1
fi

# Test Docker Compose
print_status "Testing Docker Compose..."
if docker-compose --version > /dev/null 2>&1; then
    print_success "Docker Compose is working correctly!"
    docker-compose --version
else
    print_warning "Docker Compose standalone test failed, but plugin version should work with 'docker compose'"
fi

# Test Docker Compose plugin
if docker compose version > /dev/null 2>&1; then
    print_success "Docker Compose plugin is working correctly!"
    docker compose version
fi

# Display versions
print_status "Installed versions:"
echo "Docker: $(sudo docker --version)"
echo "Docker Compose Plugin: $(docker compose version 2>/dev/null || echo 'Not available')"
echo "Docker Compose Standalone: $(docker-compose --version 2>/dev/null || echo 'Not available')"

print_success "Docker installation completed successfully!"
print_warning "IMPORTANT: You need to log out and log back in (or restart your terminal) for the docker group changes to take effect."
print_warning "After logging back in, you should be able to run docker commands without sudo."

# Optional: Start Docker daemon if in container environment
if [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null; then
    print_status "Container environment detected. Starting Docker daemon..."
    sudo dockerd > /tmp/docker.log 2>&1 &
    sleep 5
    print_success "Docker daemon started in background."
fi

print_status "Installation complete! You can now use Docker and Docker Compose."