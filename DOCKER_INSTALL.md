# Trade AI Platform v2 - Docker Installation

## 🐳 One-Command Docker Install

Run this single command on **any system** (Ubuntu, macOS, Windows WSL2):

```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/docker/clean-docker-install.sh | bash
```

## 🖥️ System Requirements

- **OS**: Ubuntu 20.04+, macOS 10.15+, Windows 10+ (with WSL2)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **Docker**: Auto-installed if not present

## ⚡ What This Does

1. ✅ **Auto-detects your OS** (Ubuntu, CentOS, macOS, Windows)
2. ✅ **Installs Docker** if not present
3. ✅ **Clones repository** to `~/trade-ai-platform-v2`
4. ✅ **Creates development environment** with hot reloading
5. ✅ **Builds all services** (Frontend, Backend, AI, Database)
6. ✅ **Seeds database** with 2 years of GONXT data
7. ✅ **Creates management scripts** for easy control

## 🚀 After Installation

### **Access URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs
- **AI Services**: http://localhost:8000

### **Login Credentials**
- **GONXT Admin**: admin@gonxt.tech / password123
- **Test Company**: demo@testcompany.demo / password123

## 🛠️ Management Commands

```bash
cd ~/trade-ai-platform-v2

# Service control
./scripts/start.sh          # Start all services
./scripts/stop.sh           # Stop all services
./scripts/status.sh         # Check service status
./scripts/logs.sh           # View all logs
./scripts/logs.sh backend   # View specific service logs
./scripts/reset.sh          # Reset everything (removes data)

# Database
./scripts/seed-data.sh      # Seed with GONXT data

# Docker commands
docker compose ps           # List containers
docker compose logs -f      # Follow all logs
docker compose restart     # Restart all services
```

## 📊 Complete Business Data

### **GONXT Company (2023-2024)**
- **50 Customers**: Woolworths, Coles, IGA, Metcash, etc.
- **100 Products**: Electronics, Health, Sports, Home & Garden
- **20,000 Sales Records**: Realistic transaction patterns
- **5,000 Trade Spends**: Promotional investment tracking
- **200 Promotions**: Campaign performance data
- **Complete Budgets**: Multi-category financial management

### **Features**
- **Multi-tenant Architecture**: Company data isolation
- **AI Predictions**: Sales forecasting and recommendations
- **Real-time Analytics**: Live dashboards and reporting
- **Role-based Access**: Admin, Manager, User permissions
- **Hot Reloading**: Development-friendly environment

## 🔧 Development Features

- **Frontend**: React with hot reloading
- **Backend**: Node.js with Nodemon auto-restart
- **Database**: MongoDB with realistic seed data
- **Cache**: Redis for session management
- **AI Services**: Local ML models for predictions

## 🔍 Troubleshooting

### **Services not starting:**
```bash
# Check Docker is running
docker info

# Check if ports are free
netstat -tulpn | grep -E ':(3000|5000|27017|6379|8000)'

# Reset and try again
./scripts/reset.sh
./scripts/start.sh
```

### **Database issues:**
```bash
# Reset database and reseed
docker compose down -v
docker compose up -d
sleep 30
./scripts/seed-data.sh
```

### **Permission issues (Linux):**
```bash
# Add user to docker group (requires logout/login)
sudo usermod -aG docker $USER
newgrp docker
```

### **macOS/Windows:**
- Ensure Docker Desktop is running
- Check Docker Desktop has sufficient resources allocated

## 📈 Performance

- **Startup Time**: 2-5 minutes (first build), 30 seconds (subsequent)
- **Resource Usage**: ~2-4GB RAM, minimal CPU during development
- **Storage**: ~5GB for images and data

## 🆘 Support

- **Repository**: https://github.com/Reshigan/trade-ai-platform-v2
- **Issues**: Create GitHub issue
- **Email**: admin@gonxt.tech

---

## 🎯 Quick Start Summary

```bash
# 1. Install (one command)
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/docker/clean-docker-install.sh | bash

# 2. Navigate to project
cd ~/trade-ai-platform-v2

# 3. Check status
./scripts/status.sh

# 4. Access application
open http://localhost:3000
```

**That's it!** Your complete Trade AI Platform with 2 years of business data is ready! 🎉