#!/bin/bash

# Universal Docker Installation Script
# Works on Ubuntu, Debian, CentOS, RHEL, Fedora, and other major Linux distributions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    elif [[ -f /etc/lsb-release ]]; then
        . /etc/lsb-release
        OS=$DISTRIB_ID
        VER=$DISTRIB_RELEASE
    elif [[ -f /etc/debian_version ]]; then
        OS=Debian
        VER=$(cat /etc/debian_version)
    elif [[ -f /etc/SuSe-release ]]; then
        OS=openSUSE
    elif [[ -f /etc/redhat-release ]]; then
        OS=RedHat
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
}

# Install Docker using convenience script (works on most distributions)
install_docker_convenience() {
    print_status "Installing Docker using convenience script..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
}

# Install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    # Get latest version
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # Download and install
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symbolic link
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
}

# Main installation function
main() {
    print_status "Universal Docker Installation Script"
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
    
    # Detect OS
    detect_os
    print_status "Detected OS: $OS $VER"
    
    # Remove old Docker versions
    print_status "Removing old Docker versions (if any)..."
    sudo systemctl stop docker 2>/dev/null || true
    
    # Try different package managers
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    elif command -v yum >/dev/null 2>&1; then
        sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-selinux docker-engine-selinux docker-engine 2>/dev/null || true
    fi
    
    # Install Docker
    install_docker_convenience
    
    # Start and enable Docker
    print_status "Starting and enabling Docker service..."
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add user to docker group
    print_status "Adding current user to docker group..."
    sudo usermod -aG docker $USER
    
    # Install Docker Compose
    install_docker_compose
    
    # Test installation
    print_status "Testing Docker installation..."
    if sudo docker run --rm hello-world > /dev/null 2>&1; then
        print_success "Docker is working correctly!"
    else
        print_error "Docker test failed."
        exit 1
    fi
    
    # Test Docker Compose
    if docker-compose --version > /dev/null 2>&1; then
        print_success "Docker Compose is working correctly!"
    else
        print_error "Docker Compose test failed."
        exit 1
    fi
    
    # Display versions
    print_status "Installed versions:"
    echo "Docker: $(sudo docker --version)"
    echo "Docker Compose: $(docker-compose --version)"
    
    print_success "Docker installation completed successfully!"
    print_warning "IMPORTANT: Log out and log back in for group changes to take effect."
    
    # Handle container environments
    if [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null; then
        print_status "Container environment detected. Starting Docker daemon..."
        sudo dockerd > /tmp/docker.log 2>&1 &
        sleep 5
        print_success "Docker daemon started."
    fi
}

# Run main function
main "$@"