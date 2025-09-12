# Docker Installation Scripts

This directory contains Docker installation scripts for different scenarios.

## Scripts Available

### 1. `install-docker.sh` - Ubuntu/Debian Specific
- **Best for**: Ubuntu, Debian, and derivatives
- **Features**: 
  - Uses official Docker APT repository
  - Installs both Docker Engine and Docker Compose plugin
  - Includes comprehensive error checking
  - Handles container environments

**Usage:**
```bash
chmod +x install-docker.sh
./install-docker.sh
```

### 2. `install-docker-universal.sh` - Universal Linux
- **Best for**: Any Linux distribution (Ubuntu, CentOS, RHEL, Fedora, etc.)
- **Features**:
  - Uses Docker's convenience script
  - Works across different package managers
  - Auto-detects OS
  - Simpler but reliable

**Usage:**
```bash
chmod +x install-docker-universal.sh
./install-docker-universal.sh
```

## Quick Manual Installation

### For Ubuntu/Debian:
```bash
# Update and install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's GPG key and repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker and add user to group
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### For CentOS/RHEL/Fedora:
```bash
# Install using convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker and add user to group
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### Docker Compose Installation:
```bash
# Get latest version and install
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Post-Installation

1. **Log out and log back in** (or restart terminal) for group changes to take effect
2. **Test installation:**
   ```bash
   docker --version
   docker compose version
   docker run hello-world
   ```

## Container Environment Notes

If running in a container environment (like this workspace), the scripts will automatically:
- Detect the container environment
- Start the Docker daemon in the background
- Configure appropriate settings

## Troubleshooting

### Permission Denied
If you get "permission denied" errors:
```bash
# Make sure you're in the docker group
groups $USER

# If not in docker group, add yourself and restart session
sudo usermod -aG docker $USER
# Then log out and log back in
```

### Docker Daemon Not Running
```bash
# Start Docker daemon
sudo systemctl start docker

# Enable auto-start
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

### In Container Environments
```bash
# Start Docker daemon manually
sudo dockerd > /tmp/docker.log 2>&1 &
sleep 5
```

## Security Notes

- These scripts require sudo privileges
- They add your user to the docker group (equivalent to root access)
- Always review scripts before running them
- Consider using rootless Docker for enhanced security in production environments