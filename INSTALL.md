# Trade AI Platform v2 - One-Command Installation

## 🚀 Quick Install

Run this single command on your Ubuntu server (13.247.139.75):

```bash
curl -fsSL https://raw.githubusercontent.com/Reshigan/trade-ai-platform-v2/main/deployment/aws/clean-install.sh | sudo bash
```

## 📋 What This Does

The installation script will:

1. ✅ Update system packages
2. ✅ Install Docker and dependencies
3. ✅ Configure firewall and security (fail2ban)
4. ✅ Create application directories and user
5. ✅ Clone the Trade AI Platform repository
6. ✅ Set up SSL certificate (Let's Encrypt)
7. ✅ Build and start all services
8. ✅ Seed database with 2 years of GONXT data
9. ✅ Configure automated backups and monitoring
10. ✅ Create management scripts

## ⏱️ Installation Time

- **Total Time**: 5-10 minutes
- **System Requirements**: Ubuntu 20.04+, 8GB RAM, 100GB storage

## 🔐 Access After Installation

**GONXT Company (Production Data):**
- URL: https://tradeai.gonxt.tech
- Email: admin@gonxt.tech
- Password: password123

**Test Company (Demo Data):**
- URL: https://tradeai.gonxt.tech
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

```bash
# Service management
sudo systemctl start|stop|restart|status trade-ai

# View logs
sudo docker compose -f /opt/trade-ai-platform-v2/docker-compose.production.yml logs -f

# Health check
sudo /opt/scripts/health-check.sh

# Manual backup
sudo /opt/scripts/backup-trade-ai.sh
```

## 🔍 Troubleshooting

If installation fails:

1. **Check system requirements**: Ubuntu 20.04+, sufficient disk space
2. **Verify network**: Ensure ports 80, 443, 22 are accessible
3. **Check DNS**: Ensure tradeai.gonxt.tech points to your server
4. **Re-run installation**: The script is idempotent and can be run multiple times

## 📞 Support

- **Repository**: https://github.com/Reshigan/trade-ai-platform-v2
- **Email**: admin@gonxt.tech
- **Documentation**: `/deployment/README.md`

---

**Ready to install?** Just run the command above! 🚀