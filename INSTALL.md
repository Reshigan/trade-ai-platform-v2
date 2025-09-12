# Trade AI Platform v2 - Installation Options

## 🚀 Choose Your Installation

### 🐳 **Docker Development** (Any OS)
Perfect for local development on Ubuntu, macOS, Windows:

```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/docker/clean-docker-install.sh | bash
```

### 🌐 **Production Server** (Ubuntu Server)
For production deployment on Ubuntu server (13.247.139.75):

```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/aws/clean-install.sh | sudo bash
```

## 📋 Installation Comparison

| Feature | Docker Development | Production Server |
|---------|-------------------|-------------------|
| **Target** | Local development | Production deployment |
| **OS Support** | Ubuntu, macOS, Windows | Ubuntu Server only |
| **SSL/HTTPS** | HTTP only | Auto SSL via Let's Encrypt |
| **Domain** | localhost | tradeai.gonxt.tech |
| **Security** | Basic | Full (firewall, fail2ban) |
| **Monitoring** | Basic | Complete (backups, alerts) |
| **Installation** | User directory | System-wide (/opt) |
| **Time** | 5 minutes | 10 minutes |

## 📋 What Both Scripts Do

1. ✅ Auto-detect OS and install Docker
2. ✅ Clone Trade AI Platform repository
3. ✅ Build and start all services (Frontend, Backend, AI, Database)
4. ✅ Seed database with 2 years of GONXT business data
5. ✅ Create management scripts for easy control
6. ✅ Configure development/production environment
7. ✅ Set up monitoring and health checks

## ⏱️ Installation Time & Requirements

### Docker Development
- **Time**: 5 minutes
- **Requirements**: 4GB RAM, 10GB storage
- **OS**: Ubuntu, macOS, Windows (WSL2)

### Production Server  
- **Time**: 10 minutes
- **Requirements**: 8GB RAM, 100GB storage
- **OS**: Ubuntu 20.04+ Server

## 🔐 Access After Installation

### Docker Development
- **URL**: http://localhost:3000
- **API**: http://localhost:5000
- **AI Services**: http://localhost:8000

### Production Server
- **URL**: https://tradeai.gonxt.tech
- **Secure HTTPS** with auto-SSL

### Login Credentials (Both)
**GONXT Company:**
- Email: admin@gonxt.tech
- Password: password123

**Test Company:**
- Email: demo@testcompany.demo  
- Password: password123

## 📊 What You Get

- **50 Customers**: Major retailers and distributors
- **100 Products**: Across 8 categories
- **20,000 Sales Records**: 2 years of transaction data
- **5,000 Trade Spends**: Promotional investment tracking
- **200 Promotions**: Campaign performance data
- **Complete Budgets**: Multi-category budget management

## 🛠️ Management Commands

### Docker Development
```bash
cd ~/trade-ai-platform-v2

# Service control
./scripts/start.sh          # Start all services
./scripts/stop.sh           # Stop all services  
./scripts/status.sh         # Check status
./scripts/logs.sh           # View logs
./scripts/seed-data.sh      # Seed database
./scripts/reset.sh          # Reset everything
```

### Production Server
```bash
# Service management
sudo systemctl start|stop|restart|status trade-ai

# Health and monitoring
sudo /opt/scripts/health-check.sh
sudo /opt/scripts/backup-trade-ai.sh

# View logs
sudo docker compose -f /opt/trade-ai-platform-v2/docker-compose.production.yml logs -f
```

## 🔍 Troubleshooting

### Docker Development Issues
```bash
# Check Docker is running
docker info

# Check ports are free  
netstat -tulpn | grep -E ':(3000|5000|27017|6379|8000)'

# Reset and try again
cd ~/trade-ai-platform-v2
./scripts/reset.sh
./scripts/start.sh
```

### Production Server Issues
1. **Check system requirements**: Ubuntu 20.04+, sufficient disk space
2. **Verify network**: Ensure ports 80, 443, 22 are accessible  
3. **Check DNS**: Ensure tradeai.gonxt.tech points to your server
4. **Re-run installation**: Scripts are idempotent and can be run multiple times

## 📞 Support

- **Repository**: https://github.com/Reshigan/trade-ai-platform-v2
- **Docker Guide**: [DOCKER_INSTALL.md](DOCKER_INSTALL.md)
- **Production Guide**: [deployment/README.md](deployment/README.md)
- **Email**: admin@gonxt.tech

---

## 🎯 Quick Start

**For Development:**
```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/docker/clean-docker-install.sh | bash
```

**For Production:**
```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/aws/clean-install.sh | sudo bash
```

**Ready to install?** Choose your option above! 🚀